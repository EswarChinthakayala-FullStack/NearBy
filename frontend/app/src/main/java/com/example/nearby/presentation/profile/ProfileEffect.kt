package com.example.nearby.presentation.profile

sealed class ProfileEffect {
    object NavigateToSettings : ProfileEffect()
    object ShowLogoutConfirmation : ProfileEffect()
    data class ShowToast(val title: String, val message: String) : ProfileEffect()
}
