package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import com.tourismguide.app.data.remote.dto.HomeDashboardDto
import com.tourismguide.app.data.remote.dto.HomePlaceDto
import com.tourismguide.app.data.remote.dto.PaginatedResponseDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

import kotlinx.serialization.Serializable

@Serializable
data class DashboardRequestBody(
    val latitude: Double,
    val longitude: Double
)

interface HomeApiService {

    @POST("home/dashboard")
    suspend fun postDashboard(
        @Body body: DashboardRequestBody
    ): Response<ApiResponseDto<HomeDashboardDto>>

    @GET("home/dashboard")
    suspend fun getDashboard(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double
    ): Response<ApiResponseDto<HomeDashboardDto>>

    @GET("home/trending")
    suspend fun getTrending(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("page") page: Int,
        @Query("page_size") pageSize: Int,
        @Query("query") query: String? = null,
        @Query("category") category: String? = null,
        @Query("min_rating") minRating: Float? = null,
        @Query("open_now") openNow: Boolean? = null,
        @Query("sortBy") sortBy: String? = null
    ): Response<com.tourismguide.app.data.remote.dto.PaginatedResponseEnvelopeDto<HomePlaceDto>>

    @GET("home/nearby")
    suspend fun getNearby(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("page") page: Int,
        @Query("page_size") pageSize: Int,
        @Query("query") query: String? = null,
        @Query("category") category: String? = null,
        @Query("min_rating") minRating: Float? = null,
        @Query("open_now") openNow: Boolean? = null,
        @Query("radius_km") radiusKm: Double? = null,
        @Query("sortBy") sortBy: String? = null
    ): Response<com.tourismguide.app.data.remote.dto.PaginatedResponseEnvelopeDto<HomePlaceDto>>

    @GET("home/recommended")
    suspend fun getRecommended(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("page") page: Int,
        @Query("page_size") pageSize: Int,
        @Query("query") query: String? = null,
        @Query("category") category: String? = null,
        @Query("min_rating") minRating: Float? = null,
        @Query("open_now") openNow: Boolean? = null,
        @Query("sortBy") sortBy: String? = null
    ): Response<com.tourismguide.app.data.remote.dto.PaginatedResponseEnvelopeDto<HomePlaceDto>>

    @GET("home/popular")
    suspend fun getPopular(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("page") page: Int,
        @Query("page_size") pageSize: Int,
        @Query("query") query: String? = null,
        @Query("category") category: String? = null,
        @Query("min_rating") minRating: Float? = null,
        @Query("open_now") openNow: Boolean? = null,
        @Query("sortBy") sortBy: String? = null
    ): Response<com.tourismguide.app.data.remote.dto.PaginatedResponseEnvelopeDto<HomePlaceDto>>
}

