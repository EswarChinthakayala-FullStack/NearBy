package com.example.nearby.presentation.explore

import com.example.nearby.presentation.home.PlaceItem

enum class SortMode(val displayName: String) {
    RELEVANCE("Relevance"),
    NEAREST("Nearest"),
    HIGHEST_RATED("Highest Rated"),
    TRENDING("Trending"),
    MOST_POPULAR("Most Popular"),
    NEWEST("Newest"),
    RECENTLY_UPDATED("Recently Updated"),
    ALPHABETICAL("Alphabetical")
}

data class ExploreFilterState(
    val selectedCategory: String = "All",
    val selectedCategories: List<String> = emptyList(),
    val distanceText: String = "Anywhere",
    val ratingText: String = "Any",
    val entryFeeText: String = "Any",
    val crowdLevelText: String = "Any",
    val sortText: String = "Relevance",
    val openNowOnly: Boolean = false,
    val wheelchairAccessible: Boolean = false,
    val parkingAvailable: Boolean = false,
    val familyFriendly: Boolean = false,
    val petFriendly: Boolean = false
)

data class FilterChipItem(
    val id: String,
    val label: String,
    val categoryType: String
)

data class ExploreUiState(
    val searchQuery: String = "",
    val filterState: ExploreFilterState = ExploreFilterState(),
    val activeFilterChips: List<FilterChipItem> = emptyList(),
    val categories: List<CategoryItem> = emptyList(),
    val recentSearches: List<String> = emptyList(),
    val searchSuggestions: List<String> = emptyList(),
    val isFilterDrawerVisible: Boolean = false,
    val isSearching: Boolean = false,
    val isOfflineMode: Boolean = false,
    val isGridView: Boolean = false,
    val totalResultsCount: Int = 0,
    val aiSummaryText: String = "Universal explore search. Adjust filters above to customize.",
    val suggestedTags: List<String> = emptyList(),
    val errorMessage: String? = null
)

data class CategoryItem(
    val id: String,
    val name: String,
    val iconRes: Int,
    val isSelected: Boolean = false
)
