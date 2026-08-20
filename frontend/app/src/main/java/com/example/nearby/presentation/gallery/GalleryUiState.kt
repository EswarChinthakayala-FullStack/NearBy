package com.example.nearby.presentation.gallery

import com.tourismguide.app.data.remote.dto.PlacePhotoDto

data class GalleryUiState(
    val isLoading: Boolean = false,
    val placeId: String = "",
    val placeName: String = "",
    val placeSlug: String = "",
    val photos: List<PlacePhotoDto> = emptyList(),
    val totalCount: Int = 0,
    val page: Int = 1,
    val isEndReached: Boolean = false,
    val errorMessage: String? = null
)
