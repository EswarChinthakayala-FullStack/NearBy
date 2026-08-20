package com.tourismguide.app.data.remote.datasource

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.DirectionsApiService
import com.tourismguide.app.data.remote.dto.DirectionsDto
import javax.inject.Inject

class DirectionsRemoteDataSource @Inject constructor(
    private val directionsApiService: DirectionsApiService
) {
    suspend fun getDirections(
        originLat: Double,
        originLng: Double,
        destLat: Double,
        destLng: Double
    ): ApiResult<DirectionsDto> {
        return try {
            val response = directionsApiService.getDirections(originLat, originLng, destLat, destLng)
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
