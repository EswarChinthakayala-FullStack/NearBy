package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ReviewUserDto(
    @SerialName("uuid") val uuid: String = "",
    @SerialName("full_name") val fullName: String = "",
    @SerialName("email") val email: String = "",
    @SerialName("avatar_url") val avatarUrl: String? = null
)

@Serializable
data class ReviewPlaceDto(
    @SerialName("uuid") val uuid: String = "",
    @SerialName("slug") val slug: String = "",
    @SerialName("name") val name: String = "",
    @SerialName("category") val category: String? = null,
    @SerialName("city") val city: String? = null,
    @SerialName("district") val district: String? = null,
    @SerialName("state") val state: String? = null,
    @SerialName("country") val country: String? = null,
    @SerialName("cover_image") val coverImage: String? = null,
    @SerialName("rating") val rating: Float = 0.0f
)

@Serializable
data class ReviewCreateDto(
    @SerialName("rating") val rating: Float,
    @SerialName("title") val title: String? = null,
    @SerialName("comment") val comment: String
)

@Serializable
data class ReviewDto(
    @SerialName("id") val integerId: Int? = null,
    @SerialName("uuid") val uuid: String = "",
    @SerialName("place_id") val placeId: String = "",
    @SerialName("user_name") val userName: String = "",
    @SerialName("author_name") val authorName: String = "",
    @SerialName("user_avatar_url") val userAvatarUrl: String? = null,
    @SerialName("rating") val rating: Float = 5.0f,
    @SerialName("title") val title: String? = null,
    @SerialName("comment") val comment: String = "",
    @SerialName("status") val status: String = "approved",
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("updated_at") val updatedAt: String? = null,
    @SerialName("likes") val likes: Int = 0,
    @SerialName("helpful_count") val helpfulCount: Int = 0,
    @SerialName("photos") val photos: List<String> = emptyList(),
    @SerialName("user") val user: ReviewUserDto? = null,
    @SerialName("place") val place: ReviewPlaceDto? = null
) {
    val id: String get() = uuid.ifEmpty { integerId?.toString() ?: "" }

    val resolvedAuthorName: String
        get() = when {
            user != null && user.fullName.isNotEmpty() -> user.fullName
            authorName.isNotEmpty() -> authorName
            userName.isNotEmpty() -> userName
            else -> "Traveler"
        }

    val resolvedAuthorEmail: String
        get() = user?.email ?: ""

    val resolvedAvatarUrl: String
        get() = user?.avatarUrl ?: userAvatarUrl ?: ""
}
