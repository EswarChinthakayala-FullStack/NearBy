package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class NotificationDto(
    @SerialName("uuid") val uuid: String,
    @SerialName("title") val title: String,
    @SerialName("message") val message: String,
    @SerialName("type") val type: String = "info",
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("link_url") val linkUrl: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)
