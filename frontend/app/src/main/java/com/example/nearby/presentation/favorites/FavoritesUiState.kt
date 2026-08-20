package com.example.nearby.presentation.favorites

import com.tourismguide.app.data.remote.dto.FavoriteDto

data class FavoritesFilterState(
    val selectedCategory: String = "All",
    val selectedCity: String = "All",
    val sortBy: String = "Recently Saved", // Recently Saved, Alphabetical, Nearest, Rating
    val minRating: Float = 0.0f,
    val openNowOnly: Boolean = false
)

data class FavoritesUiState(
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val searchQuery: String = "",
    val favorites: List<FavoriteDto> = emptyList(),
    val filteredFavorites: List<FavoriteDto> = emptyList(),
    val categories: List<String> = listOf("All", "Historical", "Temple", "Museum", "Nature", "Beach", "Park"),
    val filterState: FavoritesFilterState = FavoritesFilterState(),
    val isFilterDrawerOpen: Boolean = false,
    val errorMessage: String? = null,
    val isOfflineMode: Boolean = false,
    val page: Int = 1,
    val isEndReached: Boolean = false
)
