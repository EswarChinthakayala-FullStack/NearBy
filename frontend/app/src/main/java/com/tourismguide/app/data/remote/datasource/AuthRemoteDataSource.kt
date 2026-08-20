package com.tourismguide.app.data.remote.datasource

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.AuthApiService
import com.tourismguide.app.data.remote.dto.LoginRequest
import com.tourismguide.app.data.remote.dto.LoginResponse
import com.tourismguide.app.data.remote.dto.RegisterRequest
import javax.inject.Inject

class AuthRemoteDataSource @Inject constructor(
    private val authApiService: AuthApiService
) {
    suspend fun login(request: LoginRequest): ApiResult<LoginResponse> {
        return try {
            val response = authApiService.login(request)
            if (response.isSuccessful && response.body()?.data != null) {
                ApiResult.Success(response.body()!!.data!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: response.message()
                ApiResult.ServerError(response.code(), parseErrorMessage(errorMsg))
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }

    suspend fun register(request: RegisterRequest): ApiResult<LoginResponse> {
        return try {
            val response = authApiService.register(request)
            if (response.isSuccessful && response.body()?.data != null) {
                ApiResult.Success(response.body()!!.data!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: response.message()
                ApiResult.ServerError(response.code(), parseErrorMessage(errorMsg))
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }

    private fun parseErrorMessage(rawError: String): String {
        return if (rawError.contains("detail\":\"", ignoreCase = true)) {
            val substring = rawError.substringAfter("detail\":\"").substringBefore("\"")
            if (substring.isNotEmpty()) substring else "Authentication error occurred."
        } else if (rawError.contains("message\":\"", ignoreCase = true)) {
            val substring = rawError.substringAfter("message\":\"").substringBefore("\"")
            if (substring.isNotEmpty()) substring else "Authentication error occurred."
        } else {
            "Authentication error occurred."
        }
    }
}
