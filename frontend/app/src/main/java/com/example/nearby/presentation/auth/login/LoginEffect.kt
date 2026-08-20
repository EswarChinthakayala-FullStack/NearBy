package com.example.nearby.presentation.auth.login

sealed class LoginEffect {
    object NavigateToHome : LoginEffect()
    data class ShowToast(val title: String, val message: String) : LoginEffect()
}
