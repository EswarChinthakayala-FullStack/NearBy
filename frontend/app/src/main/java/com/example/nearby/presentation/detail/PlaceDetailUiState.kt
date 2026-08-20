package com.example.nearby.presentation.detail

import com.example.nearby.presentation.home.PlaceItem

data class DetailPlaceModel(
    val id: String,
    val name: String,
    val category: String,
    val rating: String,
    val totalReviews: String,
    val address: String,
    val isFavorite: Boolean,
    val galleryImages: List<String>,
    val description: String,
    val wikipediaHistory: String,
    val entryFee: String,
    val bestTimeToVisit: String,
    val openingHours: String,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val facilities: List<FacilityItem> = emptyList(),
    val reviews: List<ReviewItem> = emptyList(),
    val nearbyPlaces: List<PlaceItem> = emptyList(),
    val slug: String = ""
)

data class FacilityItem(
    val id: String,
    val name: String,
    val iconRes: Int,
    val isAvailable: Boolean = true
)

data class OpeningHourItem(
    val day: String,
    val hours: String,
    val isToday: Boolean = false
)

data class ReviewItem(
    val id: String,
    val authorName: String,
    val rating: Float,
    val dateAgo: String,
    val comment: String,
    val avatarUrl: String = "",
    val authorEmail: String = ""
) {
    val date: String get() = dateAgo
    val content: String get() = comment
}

data class PlaceDetailUiState(
    val isLoading: Boolean = false,
    val place: DetailPlaceModel? = null,
    val errorMessage: String? = null
)
