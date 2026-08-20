package com.example.nearby.presentation.explore

sealed interface ExploreEvent {
    data class NavigateToPlaceDetails(val placeId: String) : ExploreEvent
    data class ShowToast(val title: String, val message: String, val isError: Boolean = false) : ExploreEvent
    object OpenFilterSheet : ExploreEvent
    object OpenSortSheet : ExploreEvent
    object OpenRadiusSheet : ExploreEvent
    object OpenMapStyleSheet : ExploreEvent
    object ScrollToTop : ExploreEvent
}
