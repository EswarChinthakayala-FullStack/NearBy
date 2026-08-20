package com.example.nearby.presentation.favorites

import android.util.Log
import com.example.nearby.database.NearbyDatabase
import com.tourismguide.app.data.remote.api.FavoritesApiService
import com.tourismguide.app.data.remote.dto.FavoriteDto
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

data class FavoriteChangeEvent(
    val placeUuid: String,
    val isFavorited: Boolean
)

@Singleton
class FavoritesRepository @Inject constructor(
    private val favoritesApiService: FavoritesApiService,
    private val db: NearbyDatabase
) {

    private val _favoriteChanges = MutableSharedFlow<FavoriteChangeEvent>(replay = 1)
    val favoriteChanges: SharedFlow<FavoriteChangeEvent> = _favoriteChanges.asSharedFlow()

    suspend fun fetchFavorites(page: Int = 1, pageSize: Int = 20): Result<List<FavoriteDto>> {
        return try {
            val response = favoritesApiService.getFavorites(page, pageSize)
            if (response.isSuccessful && response.body()?.data != null) {
                val list = response.body()!!.data!!
                Log.d("FavoritesRepo", "Fetched ${list.size} favorites from backend API.")
                Result.success(list)
            } else {
                Log.w("FavoritesRepo", "Backend API returned ${response.code()}, falling back to me/favorites...")
                val meRes = favoritesApiService.getMeFavorites(page, pageSize)
                if (meRes.isSuccessful && meRes.body()?.data != null) {
                    Result.success(meRes.body()!!.data!!)
                } else {
                    Result.failure(Exception("Failed to load saved places from server (${response.code()})"))
                }
            }
        } catch (e: Exception) {
            Log.e("FavoritesRepo", "Network error fetching favorites: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun toggleFavorite(placeUuid: String, currentIsFavorited: Boolean): Result<Boolean> {
        val nextState = !currentIsFavorited
        _favoriteChanges.emit(FavoriteChangeEvent(placeUuid, nextState))

        return try {
            val response = if (nextState) {
                favoritesApiService.addFavorite(placeUuid)
            } else {
                favoritesApiService.removeFavorite(placeUuid)
            }

            if (response.isSuccessful) {
                Log.d("FavoritesRepo", "Favorite toggle API succeeded for '$placeUuid' -> isFav=$nextState")
                Result.success(nextState)
            } else {
                Log.w("FavoritesRepo", "Specific route failed with code ${response.code()}, trying toggle endpoint...")
                val toggleRes = favoritesApiService.toggleFavorite(placeUuid)
                if (toggleRes.isSuccessful) {
                    Result.success(nextState)
                } else {
                    _favoriteChanges.emit(FavoriteChangeEvent(placeUuid, currentIsFavorited))
                    Result.failure(Exception("Failed to update favorite status on server."))
                }
            }
        } catch (e: Exception) {
            Log.e("FavoritesRepo", "Network exception toggling favorite for '$placeUuid': ${e.message}", e)
            _favoriteChanges.emit(FavoriteChangeEvent(placeUuid, currentIsFavorited))
            Result.failure(e)
        }
    }

    suspend fun toggleFavoriteApi(slug: String, nextIsFavorited: Boolean): Result<Unit> {
        return try {
            val response = if (nextIsFavorited) {
                favoritesApiService.addFavorite(slug)
            } else {
                favoritesApiService.removeFavorite(slug)
            }

            if (response.isSuccessful) {
                Log.d("FavoritesRepo", "Favorite API succeeded for '$slug' -> isFav=$nextIsFavorited")
                Result.success(Unit)
            } else {
                Log.w("FavoritesRepo", "Specific route failed with code ${response.code()}, trying toggle endpoint...")
                val toggleRes = favoritesApiService.toggleFavorite(slug)
                if (toggleRes.isSuccessful) {
                    Result.success(Unit)
                } else {
                    Result.failure(Exception("Failed to update favorite status on server: ${response.code()}"))
                }
            }
        } catch (e: Exception) {
            Log.e("FavoritesRepo", "Network exception toggling favorite API for '$slug': ${e.message}", e)
            Result.failure(e)
        }
    }
}
