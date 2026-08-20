package com.tourismguide.app.data.repository

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.AiApiService
import com.tourismguide.app.data.remote.dto.AINearbyRequestDto
import com.tourismguide.app.data.remote.dto.AINearbyResponseDto
import com.tourismguide.app.data.remote.dto.ItineraryGenerateRequestDto
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto
import com.tourismguide.app.domain.repository.AiRepository
import javax.inject.Inject

class AiRepositoryImpl @Inject constructor(
    private val apiService: AiApiService
) : AiRepository {

    override suspend fun getNearbyRecommendations(
        query: String,
        latitude: Double,
        longitude: Double
    ): ApiResult<AINearbyResponseDto> {
        return try {
            val response = apiService.getNearbyRecommendations(
                AINearbyRequestDto(query = query, latitude = latitude, longitude = longitude)
            )
            if (response.isSuccessful && response.body()?.success == true && response.body()?.data != null) {
                ApiResult.Success(response.body()!!.data!!)
            } else {
                ApiResult.ServerError(response.code(), response.body()?.message ?: "Failed to fetch AI recommendations.")
            }
        } catch (e: Exception) {
            ApiResult.NetworkError(e.localizedMessage ?: "Network error occurred.")
        }
    }

    override suspend fun generateItinerary(
        query: String,
        destination: String?,
        days: Int?
    ): ApiResult<ItineraryResponseDto> {
        return try {
            val response = apiService.generateItinerary(
                ItineraryGenerateRequestDto(query = query, destination = destination, days = days)
            )
            if (response.isSuccessful && response.body()?.success == true && response.body()?.data != null) {
                ApiResult.Success(response.body()!!.data!!)
            } else {
                ApiResult.ServerError(response.code(), response.body()?.message ?: "Failed to generate AI itinerary.")
            }
        } catch (e: Exception) {
            ApiResult.NetworkError(e.localizedMessage ?: "Network error occurred.")
        }
    }
}
