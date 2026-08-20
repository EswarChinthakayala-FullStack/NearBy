package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PlacePhotoDto(
    @SerialName("image_url") val imageUrl: String = "",
    @SerialName("thumbnail_url") val thumbnailUrl: String? = null,
    @SerialName("title") val title: String = "",
    @SerialName("source") val source: String? = null
) {
    val displayUrl: String get() = imageUrl.ifEmpty { thumbnailUrl ?: "" }
    val thumbUrl: String get() = thumbnailUrl ?: imageUrl
}
