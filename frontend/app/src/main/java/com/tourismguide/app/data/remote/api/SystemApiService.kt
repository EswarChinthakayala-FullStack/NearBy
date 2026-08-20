package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import retrofit2.Response
import retrofit2.http.GET

interface SystemApiService {

    @GET("system/info")
    suspend fun getSystemInfo(): Response<ApiResponseDto<Map<String, String>>>

    @GET("legal/privacy-policy")
    suspend fun getPrivacyPolicy(): Response<ApiResponseDto<Map<String, String>>>

    @GET("legal/terms")
    suspend fun getTermsConditions(): Response<ApiResponseDto<Map<String, String>>>
}
