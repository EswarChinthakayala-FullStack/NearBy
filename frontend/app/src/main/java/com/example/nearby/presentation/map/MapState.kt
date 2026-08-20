package com.example.nearby.presentation.map

/**
 * Isolated map domain data models decoupling MapLibre SDK from presentation/domain logic.
 */
data class GeoPoint(
    val latitude: Double,
    val longitude: Double
)

data class CameraPositionState(
    val target: GeoPoint = GeoPoint(0.0, 0.0),
    val zoom: Double = 12.0,
    val tilt: Double = 0.0,
    val bearing: Double = 0.0
)

data class MapMarkerItem(
    val id: String,
    val position: GeoPoint,
    val title: String,
    val snippet: String? = null,
    val iconCategory: String? = null,
    val isSelected: Boolean = false
)

data class MapState(
    val cameraPosition: CameraPositionState = CameraPositionState(),
    val userLocation: GeoPoint? = null,
    val markers: List<MapMarkerItem> = emptyList(),
    val isFollowingUserLocation: Boolean = false,
    val isOfflineMapLoaded: Boolean = false
)
