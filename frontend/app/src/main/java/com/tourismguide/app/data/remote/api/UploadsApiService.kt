package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface UploadsApiService {
    @Multipart
    @POST("uploads/image")
    suspend fun uploadImage(
        @Part file: MultipartBody.Part
    ): Response<ApiResponseDto<Map<String, String>>>
}
