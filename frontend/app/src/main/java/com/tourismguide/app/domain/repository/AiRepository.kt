package com.tourismguide.app.domain.repository

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.dto.AINearbyResponseDto
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto

interface AiRepository {
    suspend fun getNearbyRecommendations(
        query: String,
        latitude: Double,
        longitude: Double
    ): ApiResult<AINearbyResponseDto>

    suspend fun generateItinerary(
        query: String,
        destination: String? = null,
        days: Int? = null
    ): ApiResult<ItineraryResponseDto>
}
