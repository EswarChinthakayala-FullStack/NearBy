package com.example.nearby.presentation.main

data class MainUiState(
    val isLoggedIn: Boolean = false,
    val isOffline: Boolean = false,
    val currentDestinationId: Int = 0
)
