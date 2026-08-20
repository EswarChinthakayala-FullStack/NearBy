package com.example.nearby.presentation.ainearby

sealed interface AiNearbyEffect {
    data class ShowToast(val title: String, val message: String, val isError: Boolean = false) : AiNearbyEffect
    data class NavigateToDetailBySlug(val placeSlug: String) : AiNearbyEffect
    data class NavigateToDirections(val lat: Double, val lng: Double, val name: String) : AiNearbyEffect
}
