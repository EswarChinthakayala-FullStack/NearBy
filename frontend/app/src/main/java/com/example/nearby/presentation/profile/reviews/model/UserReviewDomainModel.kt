package com.example.nearby.presentation.profile.reviews.model

data class UserReviewDomainModel(
    val reviewUuid: String = "",
    val placeUuid: String = "",
    val placeSlug: String = "",
    val placeName: String = "",
    val placeCategory: String = "",
    val city: String = "",
    val district: String = "",
    val state: String = "",
    val country: String = "",
    val coverImage: String = "",
    val placeRating: Float = 0.0f,
    val rating: Int = 5,
    val title: String = "",
    val comment: String = "",
    val createdAt: String = "",
    val updatedAt: String? = null,
    val likes: Int = 0,
    val helpfulCount: Int = 0,
    val photos: List<String> = emptyList(),
    val isExpanded: Boolean = false
)
