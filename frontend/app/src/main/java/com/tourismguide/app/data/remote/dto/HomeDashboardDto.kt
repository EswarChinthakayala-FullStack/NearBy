package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class HomeCategoryDto(
    @SerialName("id") val id: String? = null,
    @SerialName("name") val name: String? = null,
    @SerialName("slug") val slug: String? = null,
    @SerialName("icon") val icon: String? = null,
    @SerialName("count") val count: Int? = null
)

@Serializable
data class HomePlaceDto(
    @SerialName("id") val id: String? = null,
    @SerialName("uuid") val uuid: String? = null,
    @SerialName("name") val name: String? = null,
    @SerialName("slug") val slug: String? = null,
    @SerialName("category") val category: String? = null,
    @SerialName("city") val city: String? = null,
    @SerialName("state") val state: String? = null,
    @SerialName("country") val country: String? = null,
    @SerialName("rating") val rating: Double? = null,
    @SerialName("review_count") val reviewCount: Int? = null,
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("open_status") val openStatus: String? = null,
    @SerialName("distance_km") val distanceKm: Double? = null,
    @SerialName("is_favorite") val isFavorite: Boolean? = null,
    @SerialName("recommendation_reason") val recommendationReason: String? = null
)

@Serializable
data class HomeBannerDto(
    @SerialName("id") val id: String? = null,
    @SerialName("title") val title: String? = null,
    @SerialName("subtitle") val subtitle: String? = null,
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("category_slug") val categorySlug: String? = null
)

@Serializable
data class LocationContextDto(
    @SerialName("village") val village: String? = null,
    @SerialName("town") val town: String? = null,
    @SerialName("city") val city: String? = null,
    @SerialName("district") val district: String? = null,
    @SerialName("state") val state: String? = null,
    @SerialName("country") val country: String? = null,
    @SerialName("locality") val locality: String? = null,
    @SerialName("formatted_address") val formattedAddress: String? = null
)

@Serializable
data class HomeWeatherDto(
    @SerialName("temperature_c") val temperatureC: Double? = null,
    @SerialName("condition") val condition: String? = null,
    @SerialName("humidity_pct") val humidityPct: Int? = null,
    @SerialName("rain_probability_pct") val rainProbabilityPct: Int? = null,
    @SerialName("recommendation") val recommendation: String? = null
)

@Serializable
data class HomeDashboardDto(
    @SerialName("user_greeting") val userGreeting: String? = null,
    @SerialName("user_name") val userName: String? = null,
    @SerialName("user_avatar") val userAvatar: String? = null,
    @SerialName("location_name") val locationName: String? = null,
    @SerialName("location") val location: LocationContextDto? = null,
    @SerialName("weather") val weather: HomeWeatherDto? = null,
    @SerialName("trending") val trending: List<HomePlaceDto>? = null,
    @SerialName("nearby") val nearby: List<HomePlaceDto>? = null,
    @SerialName("recommended") val recommended: List<HomePlaceDto>? = null,
    @SerialName("popular") val popular: List<HomePlaceDto>? = null,
    @SerialName("categories") val categories: List<HomeCategoryDto>? = null,
    @SerialName("banners") val banners: List<HomeBannerDto>? = null
)

