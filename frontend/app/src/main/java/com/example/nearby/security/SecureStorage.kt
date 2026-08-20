package com.example.nearby.security

interface SecureStorage {
    suspend fun getAccessToken(): String?
    suspend fun saveAccessToken(token: String)
    suspend fun getRefreshToken(): String?
    suspend fun saveRefreshToken(token: String)
    suspend fun saveTokenPair(accessToken: String, refreshToken: String)
    suspend fun clearSession()
}
