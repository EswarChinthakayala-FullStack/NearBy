package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AINearbyRequestDto(
    @SerialName("query") val query: String,
    @SerialName("latitude") val latitude: Double,
    @SerialName("longitude") val longitude: Double
)

@Serializable
data class AINearbyRecommendationDto(
    @SerialName("place_uuid") val placeUuid: String = "",
    @SerialName("place_name") val placeName: String = "",
    @SerialName("place_slug") val placeSlug: String = "",
    @SerialName("category") val category: String = "",
    @SerialName("rating") val rating: Double = 0.0,
    @SerialName("distance_km") val distanceKm: Double = 0.0,
    @SerialName("confidence") val confidence: Int = 0,
    @SerialName("reason") val reason: String = "",
    @SerialName("cover_image") val coverImage: String? = null,
    @SerialName("latitude") val latitude: Double = 0.0,
    @SerialName("longitude") val longitude: Double = 0.0
)

@Serializable
data class AINearbyRecommendationGroupDto(
    @SerialName("title") val title: String = "",
    @SerialName("items") val items: List<AINearbyRecommendationDto> = emptyList()
)

@Serializable
data class AINearbyQueryUnderstandingDto(
    @SerialName("intent") val intent: String = "",
    @SerialName("primary_category") val primaryCategory: String = "",
    @SerialName("secondary_categories") val secondaryCategories: List<String> = emptyList(),
    @SerialName("weather_context") val weatherContext: String = "",
    @SerialName("time_context") val timeContext: String = ""
)

@Serializable
data class AINearbyResponseDto(
    @SerialName("summary") val summary: String = "",
    @SerialName("query_understanding") val queryUnderstanding: AINearbyQueryUnderstandingDto? = null,
    @SerialName("recommendation_groups") val recommendationGroups: List<AINearbyRecommendationGroupDto> = emptyList(),
    @SerialName("recommendations") val recommendations: List<AINearbyRecommendationDto> = emptyList()
)
