package com.example.nearby.presentation.favorites

import android.content.Context
import android.util.Log
import com.example.nearby.common.ConnectivityObserver
import com.example.nearby.database.FavoriteDao
import com.example.nearby.database.entity.FavoriteEntity
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

enum class FavoriteState {
    NOT_SAVED,
    SAVED_SYNCED,
    SAVING,
    OFFLINE_PENDING_ADD,
    OFFLINE_PENDING_REMOVE
}

enum class FavoriteToastType { SUCCESS, ERROR, INFO }

data class FavoriteToastEvent(val title: String, val message: String, val type: FavoriteToastType)

@Singleton
class FavoriteManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val favoriteDao: FavoriteDao,
    private val repository: FavoritesRepository,
    private val connectivityObserver: ConnectivityObserver
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val _favoriteStates = MutableStateFlow<Map<String, FavoriteState>>(emptyMap())
    val favoriteStates: StateFlow<Map<String, FavoriteState>> = _favoriteStates.asStateFlow()

    private val _favoriteSlugs = MutableStateFlow<Set<String>>(emptySet())
    val favoriteSlugs: StateFlow<Set<String>> = _favoriteSlugs.asStateFlow()

    private val _toastEvents = MutableSharedFlow<FavoriteToastEvent>()
    val toastEvents: SharedFlow<FavoriteToastEvent> = _toastEvents.asSharedFlow()

    init {
        // 1. Observe database cache to build initial state
        scope.launch {
            favoriteDao.getAllFavoritesFlow().collect { entities ->
                val stateMap = entities.associate { entity ->
                    entity.slug to when (entity.syncStatus) {
                        "SYNCED" -> if (entity.isFavorited) FavoriteState.SAVED_SYNCED else FavoriteState.NOT_SAVED
                        "PENDING_ADD" -> FavoriteState.OFFLINE_PENDING_ADD
                        "PENDING_REMOVE" -> FavoriteState.OFFLINE_PENDING_REMOVE
                        else -> FavoriteState.NOT_SAVED
                    }
                }
                _favoriteStates.value = stateMap
                _favoriteSlugs.value = stateMap.filter { 
                    it.value == FavoriteState.SAVED_SYNCED || it.value == FavoriteState.OFFLINE_PENDING_ADD 
                }.keys
            }
        }

        // 2. Observe connectivity to trigger auto-sync
        scope.launch {
            connectivityObserver.observe().collect { status ->
                if (status == ConnectivityObserver.Status.Available) {
                    Log.d("FavoriteManager", "Network restored. Triggering pending favorites sync...")
                    syncPendingFavorites()
                }
            }
        }

        // Initial sync
        refreshFavorites()
    }

    fun toggleFavorite(slug: String) {
        if (slug.isBlank()) return
        
        val currentState = _favoriteStates.value[slug] ?: FavoriteState.NOT_SAVED
        val nextIsFavorited = currentState == FavoriteState.NOT_SAVED || currentState == FavoriteState.OFFLINE_PENDING_REMOVE

        scope.launch {
            // Optimistic update
            if (connectivityObserver.isConnected()) {
                // Network is available -> set state to SAVING and send request
                val tempMap = _favoriteStates.value.toMutableMap()
                tempMap[slug] = FavoriteState.SAVING
                _favoriteStates.value = tempMap
                
                // Update Room
                favoriteDao.insert(FavoriteEntity(slug, nextIsFavorited, "PENDING_ADD")) // Temporary state

                val res = repository.toggleFavoriteApi(slug, nextIsFavorited)

                if (res.isSuccess) {
                    favoriteDao.insert(FavoriteEntity(slug, nextIsFavorited, "SYNCED"))
                } else {
                    // API request failed -> rollback to original status
                    Log.w("FavoriteManager", "Toggle API failed for slug $slug, rolling back...")
                    if (currentState == FavoriteState.NOT_SAVED) {
                        favoriteDao.delete(slug)
                    } else {
                        val originalIsFav = currentState == FavoriteState.SAVED_SYNCED || currentState == FavoriteState.OFFLINE_PENDING_ADD
                        favoriteDao.insert(FavoriteEntity(slug, originalIsFav, "SYNCED"))
                    }
                    
                    _toastEvents.emit(
                        FavoriteToastEvent(
                            "Sync Failed",
                            "Could not save favorite status on server.",
                            FavoriteToastType.ERROR
                        )
                    )
                }
            } else {
                // Offline -> set state to PENDING
                val syncStatus = if (nextIsFavorited) "PENDING_ADD" else "PENDING_REMOVE"
                favoriteDao.insert(FavoriteEntity(slug, nextIsFavorited, syncStatus))
                
                _toastEvents.emit(
                    FavoriteToastEvent(
                        "Saved Offline",
                        "Favorite stored locally. Will sync when online.",
                        FavoriteToastType.INFO
                    )
                )
            }
        }
    }

    fun refreshFavorites() {
        scope.launch {
            val result = repository.fetchFavorites(page = 1, pageSize = 100)
            result.onSuccess { dtoList ->
                // Clean up database cache for favorites not matching server
                // But preserve items that are pending offline edits!
                val pendingSlugs = favoriteDao.getPendingFavorites().map { it.slug }.toSet()
                
                // Insert all synced items from server
                for (dto in dtoList) {
                    val place = dto.place
                    val slug = place?.slug ?: ""
                    if (slug.isNotBlank() && !pendingSlugs.contains(slug)) {
                        favoriteDao.insert(FavoriteEntity(slug, true, "SYNCED"))
                    }
                }
            }
        }
    }

    fun syncPendingFavorites() {
        scope.launch {
            val pending = favoriteDao.getPendingFavorites()
            if (pending.isEmpty()) return@launch

            Log.d("FavoriteManager", "Syncing ${pending.size} pending favorite operations...")
            for (item in pending) {
                val res = repository.toggleFavoriteApi(item.slug, item.isFavorited)
                if (res.isSuccess) {
                    favoriteDao.insert(FavoriteEntity(item.slug, item.isFavorited, "SYNCED"))
                    Log.d("FavoriteManager", "Synced slug ${item.slug} successfully.")
                } else {
                    Log.w("FavoriteManager", "Failed to sync pending slug ${item.slug}. Will retry next connection.")
                }
            }
        }
    }
}
