package com.example.nearby.presentation.map

import com.example.nearby.presentation.home.PlaceItem

data class NearbyUiState(
    val places: List<PlaceItem> = emptyList(),
    val selectedPlace: PlaceItem? = null,
    val isDirectionsVisible: Boolean = false,
    val isStyleSwitcherVisible: Boolean = false,
    val currentMapStyle: MapStyle = MapStyle.EMERALD_DARK,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

enum class MapStyle {
    EMERALD_DARK,
    EMERALD_LIGHT,
    SATELLITE,
    TERRAIN
}
