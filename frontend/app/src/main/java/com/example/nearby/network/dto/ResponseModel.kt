package com.example.nearby.network.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ResponseModel<T>(
    @SerialName("success") val success: Boolean = true,
    @SerialName("message") val message: String = "Operation completed successfully.",
    @SerialName("data") val data: T? = null
)
