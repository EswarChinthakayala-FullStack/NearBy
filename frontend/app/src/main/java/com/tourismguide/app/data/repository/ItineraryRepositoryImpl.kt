package com.tourismguide.app.data.repository

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.ItineraryApiService
import com.tourismguide.app.data.remote.dto.ItineraryGenerateRequestDto
import com.tourismguide.app.data.remote.dto.ItineraryListItemDto
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto
import com.tourismguide.app.data.remote.dto.ItineraryUpdateRequestDto
import com.tourismguide.app.domain.repository.ItineraryRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ItineraryRepositoryImpl @Inject constructor(
    private val apiService: ItineraryApiService
) : ItineraryRepository {

    override suspend fun generateItinerary(
        query: String,
        destination: String?,
        days: Int?
    ): ApiResult<ItineraryResponseDto> {
        return try {
            val req = ItineraryGenerateRequestDto(query = query, destination = destination, days = days)
            val res = apiService.generateItinerary(req)
            if (res.isSuccessful && res.body()?.data != null) {
                ApiResult.Success(res.body()!!.data!!)
            } else {
                ApiResult.ValidationError(res.message() ?: "Failed to generate AI itinerary.")
            }
        } catch (e: Exception) {
            ApiResult.NetworkError(e.localizedMessage ?: "Network error during AI itinerary generation.")
        }
    }

    override suspend fun getUserItineraries(page: Int, pageSize: Int): ApiResult<List<ItineraryListItemDto>> {
        return try {
            val res = apiService.getUserItineraries(page, pageSize)
            if (res.isSuccessful && res.body()?.data != null) {
                ApiResult.Success(res.body()!!.data)
            } else {
                ApiResult.Success(emptyList())
            }
        } catch (e: Exception) {
            ApiResult.NetworkError(e.localizedMessage ?: "Error loading user itineraries.")
        }
    }

    override suspend fun getItineraryDetails(id: String): ApiResult<ItineraryResponseDto> {
        return try {
            val res = apiService.getItineraryDetails(id)
            if (res.isSuccessful && res.body()?.data != null) {
                ApiResult.Success(res.body()!!.data!!)
            } else {
                ApiResult.ValidationError("Itinerary details not found.")
            }
        } catch (e: Exception) {
            ApiResult.NetworkError(e.localizedMessage ?: "Error fetching itinerary details.")
        }
    }

    override suspend fun updateItinerary(
        id: String,
        title: String?,
        travelDates: String?,
        budget: String?
    ): ApiResult<ItineraryResponseDto> {
        return try {
            val req = ItineraryUpdateRequestDto(title = title, travelDates = travelDates, budget = budget)
            val res = apiService.updateItinerary(id, req)
            if (res.isSuccessful && res.body()?.data != null) {
                ApiResult.Success(res.body()!!.data!!)
            } else {
                ApiResult.ValidationError("Failed to update itinerary.")
            }
        } catch (e: Exception) {
            ApiResult.NetworkError(e.localizedMessage ?: "Error updating itinerary.")
        }
    }

    override suspend fun deleteItinerary(id: String): ApiResult<Boolean> {
        return try {
            val res = apiService.deleteItinerary(id)
            if (res.isSuccessful) {
                ApiResult.Success(true)
            } else {
                ApiResult.ValidationError("Failed to delete itinerary.")
            }
        } catch (e: Exception) {
            ApiResult.NetworkError(e.localizedMessage ?: "Error deleting itinerary.")
        }
    }

    override suspend fun duplicateItinerary(id: String): ApiResult<ItineraryResponseDto> {
        return try {
            val res = apiService.duplicateItinerary(id)
            if (res.isSuccessful && res.body()?.data != null) {
                ApiResult.Success(res.body()!!.data!!)
            } else {
                ApiResult.ValidationError("Failed to duplicate itinerary.")
            }
        } catch (e: Exception) {
            ApiResult.NetworkError(e.localizedMessage ?: "Error duplicating itinerary.")
        }
    }

    override suspend fun regenerateItinerary(id: String): ApiResult<ItineraryResponseDto> {
        return try {
            val res = apiService.regenerateItinerary(id)
            if (res.isSuccessful && res.body()?.data != null) {
                ApiResult.Success(res.body()!!.data!!)
            } else {
                ApiResult.ValidationError("Failed to regenerate itinerary.")
            }
        } catch (e: Exception) {
            ApiResult.NetworkError(e.localizedMessage ?: "Error regenerating itinerary.")
        }
    }
}
