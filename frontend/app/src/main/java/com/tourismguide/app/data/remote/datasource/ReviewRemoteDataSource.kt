package com.tourismguide.app.data.remote.datasource

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.ReviewsApiService
import com.tourismguide.app.data.remote.dto.ReviewDto
import javax.inject.Inject

class ReviewRemoteDataSource @Inject constructor(
    private val reviewsApiService: ReviewsApiService
) {
    suspend fun getReviews(placeId: String): ApiResult<List<ReviewDto>> {
        return try {
            val response = reviewsApiService.getPlaceReviews(placeId)
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
