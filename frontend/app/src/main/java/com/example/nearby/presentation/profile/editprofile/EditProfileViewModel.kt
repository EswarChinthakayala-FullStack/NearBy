package com.example.nearby.presentation.profile.editprofile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.datasource.ProfileRemoteDataSource
import com.tourismguide.app.data.remote.dto.UserUpdateDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class EditProfileViewModel @Inject constructor(
    private val profileRemoteDataSource: ProfileRemoteDataSource
) : ViewModel() {

    private val _uiState = MutableStateFlow(EditProfileUiState())
    val uiState: StateFlow<EditProfileUiState> = _uiState.asStateFlow()

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            when (val result = profileRemoteDataSource.getProfile()) {
                is ApiResult.Success -> {
                    val user = result.data
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            fullName = user.fullName,
                            username = user.username ?: "",
                            email = user.email,
                            phone = user.resolvedPhone,
                            avatarUrl = user.resolvedAvatarUrl,
                            bio = user.bio ?: "",
                            gender = user.gender ?: "Male",
                            dob = user.dateOfBirth ?: "",
                            country = user.country ?: "United States",
                            state = user.state ?: "California",
                            city = user.city ?: "San Francisco",
                            language = user.preferredLanguage ?: "English (US)",
                            isModified = false
                        )
                    }
                }
                else -> {
                    _uiState.update { it.copy(isLoading = false) }
                }
            }
        }
    }

    fun reverseGeocodeLocation(lat: Double, lng: Double, onFinished: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            when (val result = profileRemoteDataSource.reverseGeocode(lat, lng)) {
                is ApiResult.Success -> {
                    val loc = result.data
                    val countryStr = loc.country.ifBlank { _uiState.value.country }
                    val stateStr = loc.state.ifBlank { _uiState.value.state }
                    val cityStr = loc.city.ifBlank { _uiState.value.city }

                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            country = countryStr,
                            state = stateStr,
                            city = cityStr,
                            isModified = true
                        )
                    }
                    val msg = listOfNotNull(cityStr, stateStr, countryStr).filter { it.isNotBlank() }.joinToString(", ")
                    onFinished(true, "GPS location auto-detected: $msg")
                }
                else -> {
                    _uiState.update { it.copy(isLoading = false) }
                    onFinished(false, "Could not reverse geocode GPS location.")
                }
            }
        }
    }

    fun onFullNameChanged(value: String) {
        _uiState.update { it.copy(fullName = value, fullNameError = null, isModified = true) }
    }

    fun onUsernameChanged(value: String) {
        _uiState.update { it.copy(username = value, isModified = true) }
    }

    fun onPhoneChanged(value: String) {
        _uiState.update { it.copy(phone = value, isModified = true) }
    }

    fun onBioChanged(value: String) {
        _uiState.update { it.copy(bio = value, isModified = true) }
    }

    fun onGenderSelected(gender: String) {
        _uiState.update { it.copy(gender = gender, isModified = true) }
    }

    fun onCountrySelected(country: String) {
        _uiState.update { it.copy(country = country, isModified = true) }
    }

    fun onStateSelected(state: String) {
        _uiState.update { it.copy(state = state, isModified = true) }
    }

    fun onCitySelected(city: String) {
        _uiState.update { it.copy(city = city, isModified = true) }
    }

    fun onAvatarFileSelected(file: File) {
        _uiState.update { it.copy(selectedAvatarFile = file, isModified = true) }
    }

    fun saveProfile() {
        val state = _uiState.value
        if (state.fullName.isBlank()) {
            _uiState.update { it.copy(fullNameError = "Full name cannot be empty") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isSaving = true, errorMessage = null) }

            var uploadedUrl = state.avatarUrl

            // 1. Upload avatar if selected
            if (state.selectedAvatarFile != null) {
                when (val uploadResult = profileRemoteDataSource.uploadAvatarImage(state.selectedAvatarFile)) {
                    is ApiResult.Success -> {
                        uploadedUrl = uploadResult.data
                    }
                    else -> {}
                }
            }

            // 2. Send PATCH /users/me
            val dto = UserUpdateDto(
                fullName = state.fullName.trim(),
                username = state.username.trim().ifEmpty { null },
                phone = state.phone.trim().ifEmpty { null },
                avatarUrl = uploadedUrl,
                bio = state.bio.trim().ifEmpty { null },
                gender = state.gender,
                dateOfBirth = state.dob.ifEmpty { null },
                country = state.country,
                state = state.state,
                city = state.city,
                preferredLanguage = state.language
            )

            when (val updateResult = profileRemoteDataSource.updateProfile(dto)) {
                is ApiResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isSaving = false,
                            isSuccess = true,
                            isModified = false,
                            avatarUrl = uploadedUrl
                        )
                    }
                }
                else -> {
                    _uiState.update {
                        it.copy(
                            isSaving = false,
                            errorMessage = "Failed to update profile changes."
                        )
                    }
                }
            }
        }
    }
}
