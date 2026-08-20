package com.example.nearby.presentation.navigation

import com.example.nearby.presentation.map.MapManager
import org.maplibre.android.geometry.LatLng
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NavigationCameraController @Inject constructor(
    private val mapManager: MapManager
) {
    fun fitCameraToRoute(points: List<LatLng>, paddingPx: Int = 120) {
        mapManager.fitCameraToBounds(points, paddingPx)
    }

    fun recenterToUser(userLocation: LatLng, zoom: Double = 15.0) {
        mapManager.flyToPosition(userLocation, zoom)
    }

    fun resetCompass() {
        mapManager.resetCompassNorth()
    }

    fun zoomIn() {
        mapManager.zoomIn()
    }

    fun zoomOut() {
        mapManager.zoomOut()
    }
}
