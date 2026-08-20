package com.tourismguide.app.domain.repository

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.dto.ItineraryListItemDto
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto

interface ItineraryRepository {
    suspend fun generateItinerary(query: String, destination: String? = null, days: Int? = null): ApiResult<ItineraryResponseDto>
    suspend fun getUserItineraries(page: Int = 1, pageSize: Int = 20): ApiResult<List<ItineraryListItemDto>>
    suspend fun getItineraryDetails(id: String): ApiResult<ItineraryResponseDto>
    suspend fun updateItinerary(id: String, title: String? = null, travelDates: String? = null, budget: String? = null): ApiResult<ItineraryResponseDto>
    suspend fun deleteItinerary(id: String): ApiResult<Boolean>
    suspend fun duplicateItinerary(id: String): ApiResult<ItineraryResponseDto>
    suspend fun regenerateItinerary(id: String): ApiResult<ItineraryResponseDto>
}
