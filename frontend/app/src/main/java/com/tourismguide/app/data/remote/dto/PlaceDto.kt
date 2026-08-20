package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CategoryReadDto(
    @SerialName("id") val id: Int = 0,
    @SerialName("name") val name: String = "",
    @SerialName("slug") val slug: String = "",
    @SerialName("icon") val icon: String? = null
)

@Serializable
data class PlaceImageReadDto(
    @SerialName("id") val id: Int = 0,
    @SerialName("image_url") val imageUrl: String = "",
    @SerialName("thumbnail_url") val thumbnailUrl: String? = null,
    @SerialName("is_cover") val isCover: Boolean = false,
    @SerialName("source") val source: String? = null
)

@Serializable
data class PlaceDto(
    @SerialName("uuid") val uuid: String = "",
    @SerialName("id") val integerId: Int? = null,
    @SerialName("name") val name: String = "",
    @SerialName("slug") val slug: String = "",
    @SerialName("description") val descriptionStr: String? = null,
    @SerialName("history") val history: String? = null,
    @SerialName("category") val categoryObj: CategoryReadDto? = null,
    @SerialName("latitude") val latitude: Double = 0.0,
    @SerialName("longitude") val longitude: Double = 0.0,
    @SerialName("address") val addressStr: String? = null,
    @SerialName("city") val city: String? = null,
    @SerialName("state") val state: String? = null,
    @SerialName("country") val country: String? = null,
    @SerialName("entry_fee") val entryFee: String? = null,
    @SerialName("best_time_to_visit") val bestTimeToVisit: String? = null,
    @SerialName("avg_rating") val avgRating: Double = 0.0,
    @SerialName("total_reviews") val totalReviews: Int = 0,
    @SerialName("total_favorites") val totalFavorites: Int = 0,
    @SerialName("images") val images: List<PlaceImageReadDto> = emptyList(),
    @SerialName("is_favorite") val isFavorite: Boolean = false
) {
    val id: String get() = uuid.ifEmpty { integerId?.toString() ?: "" }
    val description: String get() = descriptionStr ?: history ?: ""
    val category: String get() = categoryObj?.name ?: "Historical"
    val address: String get() = addressStr ?: city ?: ""
    val rating: Double get() = avgRating
    val reviewCount: Int get() = totalReviews
    val imageUrls: List<String> get() = images.map { it.imageUrl }.filter { it.isNotEmpty() }
    val openStatus: String get() = "Open Now"
    val distanceKm: Double get() = 0.0
}

@Serializable
data class PlaceListItemDto(
    @SerialName("uuid") val uuid: String = "",
    @SerialName("id") val integerId: Int? = null,
    @SerialName("name") val name: String = "",
    @SerialName("slug") val slug: String = "",
    @SerialName("city") val city: String? = null,
    @SerialName("category") val categoryObj: CategoryReadDto? = null,
    @SerialName("cover_image_url") val coverImageUrl: String? = null,
    @SerialName("avg_rating") val avgRating: Double = 0.0,
    @SerialName("total_reviews") val totalReviews: Int = 0,
    @SerialName("is_favorite") val isFavorite: Boolean = false
) {
    val id: String get() = uuid.ifEmpty { integerId?.toString() ?: "" }
    val category: String get() = categoryObj?.name ?: "Historical"
    val distanceFormatted: String get() = city ?: "Nearby"
    val ratingFormatted: String get() = if (avgRating > 0) avgRating.toString() else "4.0"
    val imageUrl: String get() = coverImageUrl ?: ""
    val openStatus: String get() = "Open Now"
}
