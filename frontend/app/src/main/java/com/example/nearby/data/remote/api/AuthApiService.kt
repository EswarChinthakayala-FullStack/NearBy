package com.example.nearby.data.remote.api

import com.example.nearby.network.dto.LoginRequestDto
import com.example.nearby.network.dto.RefreshTokenRequestDto
import com.example.nearby.network.dto.RegisterRequestDto
import com.example.nearby.network.dto.TokenPairDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequestDto): Response<TokenPairDto>

    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequestDto): Response<TokenPairDto>

    @POST("api/v1/auth/refresh")
    suspend fun refreshToken(@Body request: RefreshTokenRequestDto): Response<TokenPairDto>

    @POST("api/v1/auth/logout")
    suspend fun logout(): Response<Unit>
}
