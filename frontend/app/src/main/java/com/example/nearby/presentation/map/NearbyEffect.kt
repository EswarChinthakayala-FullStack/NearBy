package com.example.nearby.presentation.map

sealed class NearbyEffect {
    data class AnimateCameraTo(val lat: Double, val lng: Double, val zoom: Double = 15.0) : NearbyEffect()
    data class ShowToast(val title: String, val message: String) : NearbyEffect()
}
