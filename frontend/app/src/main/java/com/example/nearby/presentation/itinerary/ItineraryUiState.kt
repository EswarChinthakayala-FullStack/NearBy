package com.example.nearby.presentation.itinerary

import com.tourismguide.app.data.remote.dto.ItineraryListItemDto
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto

data class ItineraryUiState(
    val isLoading: Boolean = false,
    val itineraries: List<ItineraryListItemDto> = emptyList(),
    val filteredItineraries: List<ItineraryListItemDto> = emptyList(),
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val errorMessage: String? = null
)

sealed interface ItineraryEvent {
    data class OnSearchQueryChanged(val query: String) : ItineraryEvent
    data class OnCategorySelected(val category: String) : ItineraryEvent
    data class OnDeleteItinerary(val id: String) : ItineraryEvent
    data class OnDuplicateItinerary(val id: String) : ItineraryEvent
    data class OnRegenerateItinerary(val id: String) : ItineraryEvent
    object Refresh : ItineraryEvent
}

sealed interface ItineraryEffect {
    data class ShowToast(val message: String) : ItineraryEffect
    data class NavigateToDetails(val id: String) : ItineraryEffect
    object OpenCreateChat : ItineraryEffect
}
