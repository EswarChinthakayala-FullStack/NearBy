package com.example.nearby.presentation.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.datasource.ProfileRemoteDataSource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val profileRemoteDataSource: ProfileRemoteDataSource
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init {
        loadProfileData()
    }

    fun loadProfileData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            val profileDeferred = async { profileRemoteDataSource.getProfile() }
            val favCountDeferred = async { profileRemoteDataSource.getFavoritesCount() }
            val revCountDeferred = async { profileRemoteDataSource.getReviewsCount() }
            val tripsCountDeferred = async { profileRemoteDataSource.getTripsCount() }

            val profileResult = profileDeferred.await()
            val favCount = favCountDeferred.await()
            val revCount = revCountDeferred.await()
            val tripsCount = tripsCountDeferred.await()

            when (profileResult) {
                is ApiResult.Success -> {
                    val user = profileResult.data
                    val handle = if (!user.username.isNullOrBlank()) "@${user.username}" else "@${user.fullName.lowercase().replace(" ", "_")}"
                    val locationStr = listOfNotNull(user.city, user.country).filter { it.isNotBlank() }.joinToString(", ")

                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            userName = user.fullName,
                            username = handle,
                            userEmail = user.email,
                            userPhone = user.resolvedPhone,
                            userAvatarUrl = user.resolvedAvatarUrl,
                            userBio = user.bio ?: "",
                            userGender = user.gender ?: "Male",
                            userDob = user.dateOfBirth ?: "",
                            userLocation = if (locationStr.isNotBlank()) locationStr else "San Francisco, United States",
                            userLanguage = user.preferredLanguage ?: "English (US)",
                            savedPlacesCount = favCount,
                            reviewsCount = revCount,
                            tripsCount = tripsCount,
                            countriesCount = 1
                        )
                    }
                }
                else -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = "Could not retrieve user account profile."
                        )
                    }
                }
            }
        }
    }
}
