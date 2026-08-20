package com.example.nearby.presentation.map

import com.example.nearby.presentation.home.PlaceItem

sealed class NearbyEvent {
    data class OnMarkerClicked(val place: PlaceItem) : NearbyEvent()
    data class OnPlaceSelected(val place: PlaceItem) : NearbyEvent()
    object OnRecenterClicked : NearbyEvent()
    object OnCompassClicked : NearbyEvent()
    data class OnStyleSelected(val style: MapStyle) : NearbyEvent()
    object OnToggleDirections : NearbyEvent()
}
