package com.tourismguide.app.data.remote

sealed class ApiResult<out T> {
    object Loading : ApiResult<Nothing>()
    data class Success<out T>(val data: T) : ApiResult<T>()
    object Empty : ApiResult<Nothing>()
    data class Unauthorized(val message: String = "Session expired. Please log in again.") : ApiResult<Nothing>()
    data class Forbidden(val message: String = "Access denied.") : ApiResult<Nothing>()
    data class ValidationError(val message: String) : ApiResult<Nothing>()
    data class NetworkError(val message: String = "No internet connection available.") : ApiResult<Nothing>()
    data class ServerError(val code: Int, val message: String = "Server temporary error.") : ApiResult<Nothing>()
    data class UnknownError(val throwable: Throwable) : ApiResult<Nothing>()
}
