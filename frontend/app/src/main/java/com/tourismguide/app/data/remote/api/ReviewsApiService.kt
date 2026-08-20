package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import com.tourismguide.app.data.remote.dto.PaginatedResponseDto
import com.tourismguide.app.data.remote.dto.ReviewCreateDto
import com.tourismguide.app.data.remote.dto.ReviewDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ReviewsApiService {
    @GET("reviews/place/{uuid}")
    suspend fun getPlaceReviews(
        @Path("uuid") placeId: String,
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 20
    ): Response<PaginatedResponseDto<ReviewDto>>

    @POST("reviews/place/{uuid}")
    suspend fun submitReview(
        @Path("uuid") placeId: String,
        @Body body: ReviewCreateDto
    ): Response<ApiResponseDto<ReviewDto>>

    @GET("reviews/me")
    suspend fun getMyReviews(
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 20
    ): Response<PaginatedResponseDto<ReviewDto>>

    @PATCH("reviews/{uuid}")
    suspend fun updateReview(
        @Path("uuid") reviewUuid: String,
        @Body body: ReviewCreateDto
    ): Response<ApiResponseDto<ReviewDto>>

    @DELETE("reviews/{uuid}")
    suspend fun deleteReview(
        @Path("uuid") reviewUuid: String
    ): Response<ApiResponseDto<Unit>>
}
