package com.example.nearby.presentation.profile

data class ProfileUiState(
    val isLoading: Boolean = false,
    val userName: String = "",
    val username: String = "",
    val userEmail: String = "",
    val userPhone: String = "",
    val userAvatarUrl: String? = null,
    val userBio: String = "",
    val userGender: String = "",
    val userDob: String = "",
    val userLocation: String = "",
    val userLanguage: String = "English (US)",
    val savedPlacesCount: Int = 0,
    val reviewsCount: Int = 0,
    val tripsCount: Int = 0,
    val countriesCount: Int = 1,
    val errorMessage: String? = null
)
