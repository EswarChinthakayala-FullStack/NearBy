package com.example.nearby.presentation.auth.register

sealed class RegisterEffect {
    object NavigateToHome : RegisterEffect()
    data class ShowToast(val title: String, val message: String) : RegisterEffect()
}
