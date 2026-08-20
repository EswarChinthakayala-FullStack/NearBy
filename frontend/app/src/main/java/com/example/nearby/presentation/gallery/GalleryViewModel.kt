package com.example.nearby.presentation.gallery

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tourismguide.app.data.remote.api.PlacesApiService
import com.tourismguide.app.data.remote.dto.PlacePhotoDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GalleryViewModel @Inject constructor(
    private val placesApiService: PlacesApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(GalleryUiState())
    val uiState: StateFlow<GalleryUiState> = _uiState.asStateFlow()

    fun initGallery(placeId: String, placeName: String, placeSlug: String) {
        val cleanSlug = placeSlug.ifEmpty {
            placeName.lowercase()
                .replace(Regex("[^a-z0-9\\s-]"), "")
                .trim()
                .replace(Regex("\\s+"), "-")
        }.ifEmpty { placeId }

        _uiState.update {
            it.copy(
                placeId = placeId,
                placeName = placeName,
                placeSlug = cleanSlug
            )
        }
        fetchPhotos(isRefresh = true)
    }

    fun refreshGallery() {
        fetchPhotos(isRefresh = true)
    }

    fun loadNextPage() {
        if (_uiState.value.isLoading) return
        _uiState.update { it.copy(isEndReached = false) }
        fetchPhotos(isRefresh = false)
    }

    private fun fetchPhotos(isRefresh: Boolean) {
        viewModelScope.launch {
            val currentState = _uiState.value
            val targetSlug = currentState.placeSlug.ifEmpty { currentState.placeId.ifEmpty { "lotus-temple" } }
            val currentOffset = if (isRefresh) 0 else currentState.photos.size

            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            try {
                Log.d("GalleryVM", "Calling API getPlacePhotos(identifier='$targetSlug', limit=30, offset=$currentOffset)")
                val response = placesApiService.getPlacePhotos(targetSlug, limit = 30, offset = currentOffset)

                if (response.isSuccessful && response.body()?.data != null) {
                    val newPhotos = response.body()!!.data!!
                    Log.d("GalleryVM", "API returned ${newPhotos.size} photos for '$targetSlug'")

                    _uiState.update { state ->
                        val updatedList = if (isRefresh) newPhotos else (state.photos + newPhotos).distinctBy { it.imageUrl }
                        state.copy(
                            isLoading = false,
                            photos = updatedList,
                            totalCount = updatedList.size,
                            isEndReached = newPhotos.isEmpty()
                        )
                    }
                } else {
                    Log.w("GalleryVM", "API error code ${response.code()} for slug '$targetSlug'")
                    _uiState.update { it.copy(isLoading = false, isEndReached = true) }
                }
            } catch (e: Exception) {
                Log.e("GalleryVM", "Failed to fetch gallery photos: ${e.message}", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = e.message ?: "Failed to load photos"
                    )
                }
            }
        }
    }
}
