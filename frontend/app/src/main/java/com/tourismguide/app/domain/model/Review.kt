package com.tourismguide.app.domain.model

data class Review(
    val id: String,
    val placeId: String,
    val userName: String,
    val userAvatarUrl: String?,
    val rating: Double,
    val comment: String,
    val createdAt: String
)

data class Favorite(
    val id: String,
    val placeId: String,
    val placeName: String,
    val placeCategory: String,
    val imageUrl: String
)

data class DirectionsResult(
    val originAddress: String,
    val destinationAddress: String,
    val distanceKm: Double,
    val durationMinutes: Int,
    val polyline: String,
    val steps: List<String>
)
