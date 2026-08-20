package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class WikipediaDto(
    @SerialName("title") val title: String = "",
    @SerialName("summary") val summary: String = "",
    @SerialName("content") val content: String = "",
    @SerialName("url") val url: String = ""
)
