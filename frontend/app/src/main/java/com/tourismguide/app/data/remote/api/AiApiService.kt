package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.AINearbyRequestDto
import com.tourismguide.app.data.remote.dto.AINearbyResponseDto
import com.tourismguide.app.data.remote.dto.ApiResponseDto
import com.tourismguide.app.data.remote.dto.ItineraryGenerateRequestDto
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface AiApiService {

    @POST("ai/nearby")
    suspend fun getNearbyRecommendations(
        @Body request: AINearbyRequestDto
    ): Response<ApiResponseDto<AINearbyResponseDto>>

    @POST("itinerary/generate")
    suspend fun generateItinerary(
        @Body request: ItineraryGenerateRequestDto
    ): Response<ApiResponseDto<ItineraryResponseDto>>

    @GET("itinerary")
    suspend fun listItineraries(): Response<ApiResponseDto<List<ItineraryResponseDto>>>

    @GET("itinerary/{id}")
    suspend fun getItineraryById(
        @Path("id") id: String
    ): Response<ApiResponseDto<ItineraryResponseDto>>

    @DELETE("itinerary/{id}")
    suspend fun deleteItinerary(
        @Path("id") id: String
    ): Response<ApiResponseDto<Map<String, Boolean>>>
}
