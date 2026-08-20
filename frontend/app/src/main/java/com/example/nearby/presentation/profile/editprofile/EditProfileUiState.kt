package com.example.nearby.presentation.profile.editprofile

import java.io.File

data class EditProfileUiState(
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val isSuccess: Boolean = false,
    val fullName: String = "",
    val username: String = "",
    val email: String = "",
    val phone: String = "",
    val bio: String = "",
    val gender: String = "Male",
    val dob: String = "",
    val country: String = "United States",
    val state: String = "California",
    val city: String = "San Francisco",
    val language: String = "English (US)",
    val avatarUrl: String? = null,
    val selectedAvatarFile: File? = null,
    val fullNameError: String? = null,
    val errorMessage: String? = null,
    val isModified: Boolean = false
)
