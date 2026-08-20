package com.example.nearby.presentation.detail

sealed interface PlaceDetailEffect {
    object ScrollToTop : PlaceDetailEffect
    object TriggerHapticFeedback : PlaceDetailEffect
}
