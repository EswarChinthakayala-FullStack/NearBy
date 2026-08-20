package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ItineraryGenerateRequestDto(
    @SerialName("query") val query: String,
    @SerialName("destination") val destination: String? = null,
    @SerialName("days") val days: Int? = null
)

@Serializable
data class ItineraryActivityDto(
    @SerialName("time") val time: String = "09:00 AM",
    @SerialName("place_slug") val placeSlug: String = "",
    @SerialName("place_name") val placeName: String = "",
    @SerialName("reason") val reason: String = "",
    @SerialName("travel_minutes") val travelMinutes: Int = 0,
    @SerialName("estimated_duration") val estimatedDuration: String = "2h"
)

@Serializable
data class ItineraryDayDto(
    @SerialName("day") val day: Int = 1,
    @SerialName("theme") val theme: String = "Explorer",
    @SerialName("activities") val activities: List<ItineraryActivityDto> = emptyList()
)

@Serializable
data class WeatherSummaryDto(
    @SerialName("temperature_c") val temperatureC: Double = 26.0,
    @SerialName("condition") val condition: String = "Clear Sky",
    @SerialName("humidity_pct") val humidityPct: Int = 60,
    @SerialName("rain_probability_pct") val rainProbabilityPct: Int = 10,
    @SerialName("recommendation") val recommendation: String = "Ideal weather for sightseeing."
)

@Serializable
data class ItineraryResponseDto(
    @SerialName("id") val id: String = "",
    @SerialName("uuid") val uuid: String? = null,
    @SerialName("destination") val destination: String = "",
    @SerialName("title") val title: String = "",
    @SerialName("summary") val summary: String = "",
    @SerialName("user_prompt") val userPrompt: String? = null,
    @SerialName("original_prompt") val originalPrompt: String? = null,
    @SerialName("theme") val theme: String? = "Cultural",
    @SerialName("trip_theme") val tripTheme: String? = null,
    @SerialName("places_count") val placesCount: Int = 0,
    @SerialName("estimated_distance_km") val estimatedDistanceKm: Double = 0.0,
    @SerialName("travel_dates") val travelDates: String? = null,
    @SerialName("estimated_duration") val estimatedDuration: String? = null,
    @SerialName("budget") val budget: String? = null,
    @SerialName("trip_type") val tripType: String? = null,
    @SerialName("cover_image") val coverImage: String? = null,
    @SerialName("weather_summary") val weatherSummary: WeatherSummaryDto? = null,
    @SerialName("travel_tips") val travelTips: List<String> = emptyList(),
    @SerialName("days") val days: List<ItineraryDayDto> = emptyList(),
    @SerialName("status") val status: String = "completed",
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("updated_at") val updatedAt: String? = null
) {
    val resolvedId: String get() = if (id.isNotBlank()) id else (uuid ?: "")
    val prompt: String get() = userPrompt ?: originalPrompt ?: "Explore top attractions in $destination"
    val resolvedTheme: String get() = tripTheme ?: theme ?: "Cultural"
}

@Serializable
data class ItineraryListItemDto(
    @SerialName("id") val id: String = "",
    @SerialName("uuid") val uuid: String? = null,
    @SerialName("destination") val destination: String = "",
    @SerialName("title") val title: String = "",
    @SerialName("user_prompt") val userPrompt: String? = null,
    @SerialName("original_prompt") val originalPrompt: String? = null,
    @SerialName("theme") val theme: String? = null,
    @SerialName("trip_theme") val tripTheme: String? = null,
    @SerialName("places_count") val placesCount: Int? = null,
    @SerialName("places") val places: Int? = null,
    @SerialName("estimated_distance_km") val estimatedDistanceKm: Double = 0.0,
    @SerialName("travel_dates") val travelDates: String? = null,
    @SerialName("estimated_duration") val estimatedDuration: String? = null,
    @SerialName("budget") val budget: String? = null,
    @SerialName("day_count") val dayCount: Int? = null,
    @SerialName("days") val days: Int? = null,
    @SerialName("cover_image") val coverImage: String? = null,
    @SerialName("status") val status: String = "completed",
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("updated_at") val updatedAt: String? = null
) {
    val resolvedId: String get() = if (id.isNotBlank()) id else (uuid ?: "")
    val prompt: String get() = userPrompt ?: originalPrompt ?: "Explore top attractions in $destination"
    val resolvedTheme: String get() = tripTheme ?: theme ?: "Cultural"
    val totalPlaces: Int get() = places ?: placesCount ?: 5
    val totalDays: Int get() = days ?: dayCount ?: 1
    val durationLabel: String get() = estimatedDuration ?: travelDates ?: "$totalDays Days"
}

@Serializable
data class ItineraryUpdateRequestDto(
    @SerialName("title") val title: String? = null,
    @SerialName("travel_dates") val travelDates: String? = null,
    @SerialName("budget") val budget: String? = null
)
