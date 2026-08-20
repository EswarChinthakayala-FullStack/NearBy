package com.example.nearby.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PaginatedResponse<T>(
    @SerialName("success") val success: Boolean = true,
    @SerialName("message") val message: String = "Data retrieved successfully.",
    @SerialName("data") val data: List<T> = emptyList(),
    @SerialName("pagination") val pagination: PaginationMetaDto
)
