package com.example.nearby.presentation.ainearby

sealed interface AiNearbyEvent {
    data class SubmitQuery(val query: String) : AiNearbyEvent
    data class UpdateLocation(val latitude: Double, val longitude: Double) : AiNearbyEvent
    data class ToggleFavorite(val placeUuid: String) : AiNearbyEvent
    object Refresh : AiNearbyEvent
}
