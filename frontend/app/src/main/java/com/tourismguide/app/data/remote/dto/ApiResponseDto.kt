package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ApiResponseDto<T>(
    @SerialName("success") val success: Boolean = true,
    @SerialName("message") val message: String = "",
    @SerialName("data") val data: T? = null
)

@Serializable
data class PaginatedResponseEnvelopeDto<T>(
    @SerialName("success") val success: Boolean = true,
    @SerialName("message") val message: String = "",
    @SerialName("data") val data: List<T> = emptyList(),
    @SerialName("pagination") val pagination: PaginationMetaDto? = null
)

@Serializable
data class PaginationMetaDto(
    @SerialName("page") val page: Int = 1,
    @SerialName("page_size") val pageSize: Int = 20,
    @SerialName("total_items") val totalItems: Int = 0,
    @SerialName("total_pages") val totalPages: Int = 0
)

@Serializable
data class PaginatedResponseDto<T>(
    @SerialName("data") val data: List<T> = emptyList(),
    @SerialName("items") val items: List<T> = emptyList(),
    @SerialName("page") val page: Int = 1,
    @SerialName("page_size") val pageSize: Int = 20,
    @SerialName("total") val total: Int = 0,
    @SerialName("pagination") val pagination: PaginationMetaDto? = null
) {
    val listItems: List<T> get() = data.ifEmpty { items }
    val totalCount: Int get() = pagination?.totalItems ?: if (total > 0) total else listItems.size
}
