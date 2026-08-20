package com.example.nearby.presentation.profile

sealed class ProfileEvent {
    object OnEditProfileClicked : ProfileEvent()
    object OnSettingsClicked : ProfileEvent()
    object OnLogoutClicked : ProfileEvent()
}
