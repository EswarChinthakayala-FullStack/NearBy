package com.example.nearby.presentation.splash

sealed class SplashUiState {
    object Initial : SplashUiState()
    object Verifying : SplashUiState()
    object Authenticated : SplashUiState()
    object Unauthenticated : SplashUiState()
}
