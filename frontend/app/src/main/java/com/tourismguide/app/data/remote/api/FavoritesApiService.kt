package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import com.tourismguide.app.data.remote.dto.FavoriteDto
import com.tourismguide.app.data.remote.dto.PaginatedResponseDto
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.Response
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

@Serializable
data class FavoriteToggleResponseDto(
    @SerialName("is_favorited") val isFavorited: Boolean? = null,
    @SerialName("message") val message: String? = null,
    @SerialName("total_favorites") val totalFavorites: Int? = null
)

interface FavoritesApiService {
    @GET("favorites")
    suspend fun getFavorites(
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 20
    ): Response<PaginatedResponseDto<FavoriteDto>>

    @GET("me/favorites")
    suspend fun getMeFavorites(
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 20
    ): Response<PaginatedResponseDto<FavoriteDto>>

    @POST("favorites/{uuid}/toggle")
    suspend fun toggleFavorite(@Path("uuid") placeId: String): Response<ApiResponseDto<FavoriteToggleResponseDto>>

    @POST("places/{uuid}/favorite")
    suspend fun addFavorite(@Path("uuid") placeId: String): Response<ApiResponseDto<FavoriteToggleResponseDto>>

    @DELETE("places/{uuid}/favorite")
    suspend fun removeFavorite(@Path("uuid") placeId: String): Response<ApiResponseDto<FavoriteToggleResponseDto>>

    @DELETE("favorites/{uuid}")
    suspend fun deleteFavorite(@Path("uuid") placeId: String): Response<ApiResponseDto<FavoriteToggleResponseDto>>
}
