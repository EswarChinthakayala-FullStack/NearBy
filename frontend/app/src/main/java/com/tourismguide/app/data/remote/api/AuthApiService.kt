package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import com.tourismguide.app.data.remote.dto.ChangePasswordDto
import com.tourismguide.app.data.remote.dto.LoginRequest
import com.tourismguide.app.data.remote.dto.LoginResponse
import com.tourismguide.app.data.remote.dto.RegisterRequest
import com.tourismguide.app.data.remote.dto.UserDto
import com.tourismguide.app.data.remote.dto.UserUpdateDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST

interface AuthApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponseDto<LoginResponse>>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponseDto<LoginResponse>>

    @GET("users/me")
    suspend fun getCurrentUser(): Response<ApiResponseDto<UserDto>>

    @PATCH("users/me")
    suspend fun updateProfile(@Body request: UserUpdateDto): Response<ApiResponseDto<UserDto>>

    @POST("users/me/change-password")
    suspend fun changePassword(@Body request: ChangePasswordDto): Response<ApiResponseDto<Map<String, String>>>
}
