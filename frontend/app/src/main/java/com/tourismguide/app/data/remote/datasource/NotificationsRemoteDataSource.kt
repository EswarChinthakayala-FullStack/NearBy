package com.tourismguide.app.data.remote.datasource

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.NotificationsApiService
import com.tourismguide.app.data.remote.dto.NotificationDto
import javax.inject.Inject

class NotificationsRemoteDataSource @Inject constructor(
    private val notificationsApiService: NotificationsApiService
) {
    suspend fun getNotifications(): ApiResult<List<NotificationDto>> {
        return try {
            val response = notificationsApiService.getNotifications()
            if (response.isSuccessful && response.body()?.data != null) {
                ApiResult.Success(response.body()!!.data!!)
            } else {
                ApiResult.ServerError(response.code(), response.message())
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }

    suspend fun markRead(uuid: String): ApiResult<Unit> {
        return try {
            val response = notificationsApiService.markRead(uuid)
            if (response.isSuccessful) ApiResult.Success(Unit)
            else ApiResult.ServerError(response.code(), response.message())
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }

    suspend fun clearAll(): ApiResult<Unit> {
        return try {
            val response = notificationsApiService.clearAll()
            if (response.isSuccessful) ApiResult.Success(Unit)
            else ApiResult.ServerError(response.code(), response.message())
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }
}
