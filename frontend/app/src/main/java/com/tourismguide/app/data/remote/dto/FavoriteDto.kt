package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class FavoritePlaceSummaryDto(
    @SerialName("uuid") val uuid: String = "",
    @SerialName("name") val name: String = "",
    @SerialName("slug") val slug: String = "",
    @SerialName("city") val city: String? = null,
    @SerialName("category") val categoryObj: CategoryReadDto? = null,
    @SerialName("cover_image_url") val coverImageUrl: String? = null,
    @SerialName("avg_rating") val avgRating: Double = 0.0,
    @SerialName("total_reviews") val totalReviews: Int = 0,
    @SerialName("latitude") val latitude: Double = 0.0,
    @SerialName("longitude") val longitude: Double = 0.0
) {
    val category: String get() = categoryObj?.name ?: ""
}

@Serializable
data class FavoriteDto(
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("place") val place: FavoritePlaceSummaryDto? = null
) {
    // Backward compat - derive from nested place summary
    val id: String get() = place?.uuid ?: ""
    val placeId: String get() = place?.uuid ?: ""
    val placeName: String get() = place?.name ?: ""
    val placeCategory: String get() = place?.category ?: ""
    val imageUrl: String get() = place?.coverImageUrl ?: ""
}
