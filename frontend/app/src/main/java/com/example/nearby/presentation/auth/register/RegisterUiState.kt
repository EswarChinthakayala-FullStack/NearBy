package com.example.nearby.presentation.auth.register

data class RegisterUiState(
    val currentStep: Int = 1,
    val name: String = "",
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val phone: String = "",
    val country: String = "United States",
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)
