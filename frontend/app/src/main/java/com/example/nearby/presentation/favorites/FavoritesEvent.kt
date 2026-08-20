package com.example.nearby.presentation.favorites

sealed interface FavoritesEvent {
    object Refresh : FavoritesEvent
    object LoadNextPage : FavoritesEvent
    data class SearchQueryChanged(val query: String) : FavoritesEvent
    data class CategorySelected(val category: String) : FavoritesEvent
    data class ToggleFavoriteOptimistic(val placeUuid: String) : FavoritesEvent
    data class ApplyFilters(val filterState: FavoritesFilterState) : FavoritesEvent
    object ResetFilters : FavoritesEvent
    data class ToggleFilterDrawer(val isOpen: Boolean) : FavoritesEvent
}
