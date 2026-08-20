package com.example.nearby.presentation.profile.mytrips.model

data class TripDomainModel(
    val uuid: String = "",
    val destination: String = "",
    val title: String = "",
    val prompt: String = "",
    val theme: String = "Cultural",
    val daysCount: Int = 1,
    val placesCount: Int = 0,
    val estimatedDistanceKm: Double = 0.0,
    val estimatedDuration: String = "1 Day",
    val weatherTempC: Double = 26.0,
    val weatherCondition: String = "Clear Sky",
    val coverImage: String = "",
    val status: String = "completed",
    val createdAt: String = "",
    val updatedAt: String? = null,
    val isExpanded: Boolean = false
)
