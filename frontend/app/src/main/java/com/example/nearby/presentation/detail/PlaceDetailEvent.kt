package com.example.nearby.presentation.detail

sealed interface PlaceDetailEvent {
    data class NavigateToGallery(val initialIndex: Int, val imageUrls: ArrayList<String>) : PlaceDetailEvent
    data class NavigateToPlaceDetails(val placeId: String) : PlaceDetailEvent
    object OpenDirections : PlaceDetailEvent
    object DialPhone : PlaceDetailEvent
    object OpenWebsite : PlaceDetailEvent
    object OpenReviewSheet : PlaceDetailEvent
    data class ShowToast(val title: String, val message: String, val isError: Boolean = false) : PlaceDetailEvent
    object SharePlace : PlaceDetailEvent
}
