package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import com.tourismguide.app.data.remote.dto.ItineraryGenerateRequestDto
import com.tourismguide.app.data.remote.dto.ItineraryListItemDto
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto
import com.tourismguide.app.data.remote.dto.ItineraryUpdateRequestDto
import com.tourismguide.app.data.remote.dto.PaginatedResponseDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ItineraryApiService {

    @POST("ai/itinerary/generate")
    suspend fun generateItinerary(
        @Body request: ItineraryGenerateRequestDto
    ): Response<ApiResponseDto<ItineraryResponseDto>>

    @GET("ai/itinerary")
    suspend fun getUserItineraries(
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 20
    ): Response<PaginatedResponseDto<ItineraryListItemDto>>

    @GET("ai/itinerary/{id}")
    suspend fun getItineraryDetails(
        @Path("id") id: String
    ): Response<ApiResponseDto<ItineraryResponseDto>>

    @PATCH("ai/itinerary/{id}")
    suspend fun updateItinerary(
        @Path("id") id: String,
        @Body request: ItineraryUpdateRequestDto
    ): Response<ApiResponseDto<ItineraryResponseDto>>

    @DELETE("ai/itinerary/{id}")
    suspend fun deleteItinerary(
        @Path("id") id: String
    ): Response<ApiResponseDto<Map<String, String>>>

    @POST("ai/itinerary/{id}/duplicate")
    suspend fun duplicateItinerary(
        @Path("id") id: String
    ): Response<ApiResponseDto<ItineraryResponseDto>>

    @POST("ai/itinerary/{id}/regenerate")
    suspend fun regenerateItinerary(
        @Path("id") id: String
    ): Response<ApiResponseDto<ItineraryResponseDto>>
}
