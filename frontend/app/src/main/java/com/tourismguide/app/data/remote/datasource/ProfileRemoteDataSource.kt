package com.tourismguide.app.data.remote.datasource

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.AuthApiService
import com.tourismguide.app.data.remote.api.FavoritesApiService
import com.tourismguide.app.data.remote.api.ItineraryApiService
import com.tourismguide.app.data.remote.api.LocationApiService
import com.tourismguide.app.data.remote.api.ReviewsApiService
import com.tourismguide.app.data.remote.api.UploadsApiService
import com.tourismguide.app.data.remote.dto.ChangePasswordDto
import com.tourismguide.app.data.remote.dto.LocationReverseDto
import com.tourismguide.app.data.remote.dto.UserDto
import com.tourismguide.app.data.remote.dto.UserUpdateDto
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import java.io.File
import javax.inject.Inject

class ProfileRemoteDataSource @Inject constructor(
    private val authApiService: AuthApiService,
    private val favoritesApiService: FavoritesApiService,
    private val reviewsApiService: ReviewsApiService,
    private val itineraryApiService: ItineraryApiService,
    private val uploadsApiService: UploadsApiService,
    private val locationApiService: LocationApiService
) {
    suspend fun getProfile(): ApiResult<UserDto> {
        return try {
            val response = authApiService.getCurrentUser()
            if (response.isSuccessful && response.body()?.data != null) {
                ApiResult.Success(response.body()!!.data!!)
            } else {
                ApiResult.ServerError(response.code(), response.message())
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }

    suspend fun updateProfile(dto: UserUpdateDto): ApiResult<UserDto> {
        return try {
            val response = authApiService.updateProfile(dto)
            if (response.isSuccessful && response.body()?.data != null) {
                ApiResult.Success(response.body()!!.data!!)
            } else {
                ApiResult.ServerError(response.code(), response.message())
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }

    suspend fun reverseGeocode(lat: Double, lng: Double): ApiResult<LocationReverseDto> {
        return try {
            val response = locationApiService.reverseGeocode(lat, lng)
            if (response.isSuccessful && response.body()?.data != null) {
                ApiResult.Success(response.body()!!.data!!)
            } else {
                ApiResult.ServerError(response.code(), response.message())
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }

    suspend fun uploadAvatarImage(imageFile: File): ApiResult<String> {
        return try {
            val requestFile = imageFile.asRequestBody("image/*".toMediaTypeOrNull())
            val body = MultipartBody.Part.createFormData("file", imageFile.name, requestFile)
            val response = uploadsApiService.uploadImage(body)
            if (response.isSuccessful && response.body()?.data != null) {
                val url = response.body()!!.data!!["url"] ?: ""
                ApiResult.Success(url)
            } else {
                ApiResult.ServerError(response.code(), response.message())
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }

    suspend fun changePassword(current: String, newPass: String): ApiResult<Unit> {
        return try {
            val response = authApiService.changePassword(ChangePasswordDto(currentPassword = current, newPassword = newPass))
            if (response.isSuccessful) {
                ApiResult.Success(Unit)
            } else {
                val errorMsg = try {
                    val errJson = response.errorBody()?.string()
                    if (!errJson.isNullOrEmpty() && errJson.contains("message")) {
                        val obj = JSONObject(errJson)
                        val errObj = obj.optJSONObject("error")
                        errObj?.optString("message") ?: obj.optString("message", response.message())
                    } else response.message()
                } catch (e: Exception) {
                    response.message()
                }
                ApiResult.ServerError(response.code(), errorMsg)
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }

    suspend fun getFavoritesCount(): Int {
        return try {
            val response = favoritesApiService.getFavorites()
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.totalCount
            } else {
                0
            }
        } catch (e: Exception) {
            0
        }
    }

    suspend fun getReviewsCount(): Int {
        return try {
            val response = reviewsApiService.getMyReviews()
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.totalCount
            } else {
                0
            }
        } catch (e: Exception) {
            0
        }
    }

    suspend fun getTripsCount(): Int {
        return try {
            val response = itineraryApiService.getUserItineraries()
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.totalCount
            } else {
                0
            }
        } catch (e: Exception) {
            0
        }
    }
}
