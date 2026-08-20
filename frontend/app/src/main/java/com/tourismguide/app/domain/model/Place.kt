package com.tourismguide.app.domain.model

data class Place(
    val id: String,
    val name: String,
    val description: String,
    val category: String,
    val latitude: Double,
    val longitude: Double,
    val address: String,
    val rating: Double,
    val reviewCount: Int,
    val imageUrls: List<String>,
    val openStatus: String,
    val distanceKm: Double,
    val isFavorite: Boolean = false
)

data class PlaceListItem(
    val id: String,
    val name: String,
    val category: String,
    val distanceFormatted: String,
    val ratingFormatted: String,
    val imageUrl: String,
    val openStatus: String,
    val isFavorite: Boolean = false
)
