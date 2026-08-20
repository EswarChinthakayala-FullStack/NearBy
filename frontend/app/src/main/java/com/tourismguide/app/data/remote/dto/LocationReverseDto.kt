package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LocationReverseDto(
    @SerialName("city") val city: String = "",
    @SerialName("state") val state: String = "",
    @SerialName("country") val country: String = "",
    @SerialName("display_name") val displayName: String = ""
)
