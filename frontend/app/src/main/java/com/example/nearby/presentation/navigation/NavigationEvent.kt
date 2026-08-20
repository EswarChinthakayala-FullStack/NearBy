package com.example.nearby.presentation.navigation

import org.maplibre.android.geometry.LatLng

sealed class NavigationEvent {
    object StartNavigationClicked : NavigationEvent()
    object RecenterCameraClicked : NavigationEvent()
    data class ModeChanged(val newMode: String) : NavigationEvent()
    data class ToggleFavorite(val slug: String) : NavigationEvent()
}

sealed class NavigationEffect {
    data class ShowToast(val title: String, val message: String) : NavigationEffect()
    data class AnimateCameraToBounds(val points: List<LatLng>, val paddingPx: Int = 120) : NavigationEffect()
    data class LaunchExternalNavigation(val latitude: Double, val longitude: Double, val destinationName: String) : NavigationEffect()
    object RequestLocationPermission : NavigationEffect()
}
