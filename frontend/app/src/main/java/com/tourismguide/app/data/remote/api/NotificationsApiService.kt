package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import com.tourismguide.app.data.remote.dto.NotificationDto
import retrofit2.Response
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Path

interface NotificationsApiService {

    @GET("notifications")
    suspend fun getNotifications(): Response<ApiResponseDto<List<NotificationDto>>>

    @PATCH("notifications/{uuid}/read")
    suspend fun markRead(@Path("uuid") uuid: String): Response<ApiResponseDto<NotificationDto>>

    @DELETE("notifications/clear-all")
    suspend fun clearAll(): Response<ApiResponseDto<Map<String, String>>>
}
