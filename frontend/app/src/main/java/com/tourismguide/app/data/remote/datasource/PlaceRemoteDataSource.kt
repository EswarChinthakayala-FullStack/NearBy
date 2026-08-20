package com.tourismguide.app.data.remote.datasource

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.PlacesApiService
import com.tourismguide.app.data.remote.dto.PlaceListItemDto
import javax.inject.Inject

class PlaceRemoteDataSource @Inject constructor(
    private val placesApiService: PlacesApiService
) {
    suspend fun getNearbyPlaces(lat: Double, lng: Double): ApiResult<List<PlaceListItemDto>> {
        return try {
            val response = placesApiService.getNearbyPlaces(lat, lng)
            val apiDto = response.body()
            if (response.isSuccessful && apiDto != null && apiDto.data != null) {
                ApiResult.Success(apiDto.data)
            } else {
                ApiResult.ServerError(response.code(), response.message())
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }
}
