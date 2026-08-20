package com.example.nearby.presentation.explore

sealed interface ExploreAction {
    data class OnSearchQueryChanged(val query: String) : ExploreAction
    data class OnCategorySelected(val categoryName: String) : ExploreAction
    data class OnSortSelected(val sortMode: SortMode) : ExploreAction
    data class OnFilterApplied(val newFilterState: ExploreFilterState) : ExploreAction
    data class OnFilterChipRemoved(val chipId: String) : ExploreAction
    object OnClearAllFilters : ExploreAction
    data class OnPlaceClicked(val placeId: String) : ExploreAction
    data class OnBookmarkToggled(val placeId: String) : ExploreAction
    object OnFilterFabClicked : ExploreAction
    object OnSortClicked : ExploreAction
    data class OnRecentSearchClicked(val query: String) : ExploreAction
    data class OnSearchSuggestionClicked(val suggestion: String) : ExploreAction
    object OnVoiceSearchClicked : ExploreAction
}
