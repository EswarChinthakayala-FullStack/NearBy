package com.example.nearby.presentation.favorites

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FavoritesViewModel @Inject constructor(
    private val repository: FavoritesRepository,
    private val favoriteManager: com.example.nearby.presentation.favorites.FavoriteManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(FavoritesUiState())
    val uiState: StateFlow<FavoritesUiState> = _uiState.asStateFlow()

    private val _effectFlow = MutableSharedFlow<FavoritesEffect>()
    val effectFlow: SharedFlow<FavoritesEffect> = _effectFlow.asSharedFlow()

    init {
        loadFavorites()
        observeGlobalFavoriteChanges()
    }

    fun onEvent(event: FavoritesEvent) {
        when (event) {
            is FavoritesEvent.Refresh -> loadFavorites(isRefresh = true)
            is FavoritesEvent.LoadNextPage -> loadNextPage()
            is FavoritesEvent.SearchQueryChanged -> {
                _uiState.update { it.copy(searchQuery = event.query) }
                applyFilterAndSearch()
            }
            is FavoritesEvent.CategorySelected -> {
                _uiState.update { state ->
                    state.copy(filterState = state.filterState.copy(selectedCategory = event.category))
                }
                applyFilterAndSearch()
            }
            is FavoritesEvent.ToggleFavoriteOptimistic -> toggleFavoriteOptimistic(event.placeUuid)
            is FavoritesEvent.ApplyFilters -> {
                _uiState.update { it.copy(filterState = event.filterState) }
                applyFilterAndSearch()
            }
            is FavoritesEvent.ResetFilters -> {
                _uiState.update { it.copy(filterState = FavoritesFilterState()) }
                applyFilterAndSearch()
            }
            is FavoritesEvent.ToggleFilterDrawer -> {
                _uiState.update { it.copy(isFilterDrawerOpen = event.isOpen) }
            }
        }
    }

    private fun loadFavorites(isRefresh: Boolean = false) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = repository.fetchFavorites(page = 1, pageSize = 30)

            result.onSuccess { list ->
                _uiState.update { state ->
                    state.copy(
                        isLoading = false,
                        favorites = list,
                        page = 1,
                        isEndReached = list.size < 30
                    )
                }
                applyFilterAndSearch()
            }.onFailure { err ->
                Log.e("FavoritesVM", "Failed to load favorites: ${err.message}", err)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = err.message ?: "Could not load saved places."
                    )
                }
            }
        }
    }

    private fun loadNextPage() {
        val state = _uiState.value
        if (state.isLoading || state.isEndReached) return

        viewModelScope.launch {
            val nextPage = state.page + 1
            val result = repository.fetchFavorites(page = nextPage, pageSize = 30)

            result.onSuccess { newList ->
                _uiState.update { cur ->
                    val combined = (cur.favorites + newList).distinctBy { it.id }
                    cur.copy(
                        favorites = combined,
                        page = nextPage,
                        isEndReached = newList.isEmpty()
                    )
                }
                applyFilterAndSearch()
            }
        }
    }

    private fun toggleFavoriteOptimistic(placeUuid: String) {
        val currentList = _uiState.value.favorites
        val targetItem = currentList.find { it.id == placeUuid || it.placeId == placeUuid } ?: return
        val slug = targetItem.place?.slug ?: placeUuid

        favoriteManager.toggleFavorite(slug)

        viewModelScope.launch {
            _effectFlow.emit(FavoritesEffect.ShowToast("Place Removed", "'${targetItem.placeName}' removed from saved places.", FavoritesEffect.ToastType.INFO))
        }
    }

    private fun applyFilterAndSearch() {
        val state = _uiState.value
        var result = state.favorites

        // Filter by Search Query
        if (state.searchQuery.isNotBlank()) {
            val q = state.searchQuery.trim().lowercase()
            result = result.filter {
                it.placeName.lowercase().contains(q) ||
                        (it.place?.city ?: "").lowercase().contains(q) ||
                        it.placeCategory.lowercase().contains(q)
            }
        }

        // Filter by Category
        val selCat = state.filterState.selectedCategory
        if (selCat != "All") {
            result = result.filter { it.placeCategory.equals(selCat, ignoreCase = true) }
        }

        // Filter by Min Rating
        if (state.filterState.minRating > 0f) {
            result = result.filter { (it.place?.avgRating ?: 0.0) >= state.filterState.minRating }
        }

        // Sort
        result = when (state.filterState.sortBy) {
            "Alphabetical" -> result.sortedBy { it.placeName }
            "Rating" -> result.sortedByDescending { it.place?.avgRating ?: 0.0 }
            else -> result // Recently Saved
        }

        _uiState.update { it.copy(filteredFavorites = result) }
    }

    private fun observeGlobalFavoriteChanges() {
        viewModelScope.launch {
            favoriteManager.favoriteSlugs.collect { favSlugs ->
                val current = _uiState.value.favorites
                val updated = current.filter { dto ->
                    val slug = dto.place?.slug ?: ""
                    favSlugs.contains(slug)
                }
                if (updated.size != current.size) {
                    _uiState.update { it.copy(favorites = updated) }
                    applyFilterAndSearch()
                }
            }
        }
    }
}
