package com.example.nearby.network.interceptors

import com.example.nearby.BuildConfig
import com.example.nearby.data.local.SessionManager
import com.example.nearby.network.dto.RefreshTokenRequestDto
import com.example.nearby.network.dto.ResponseModel
import com.example.nearby.network.dto.TokenPairDto
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import okhttp3.Authenticator
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject
import javax.inject.Provider
import javax.inject.Singleton

@Singleton
class TokenAuthenticator @Inject constructor(
    private val sessionManager: SessionManager,
    private val json: Json,
    private val okHttpClientProvider: Provider<OkHttpClient>
) : Authenticator {

    override fun authenticate(route: Route?, response: Response): Request? {
        if (response.request.url.encodedPath.contains("/auth/refresh")) {
            runBlocking { sessionManager.clearSession() }
            return null
        }

        val refreshToken = runBlocking { sessionManager.getRefreshToken() } ?: return null

        synchronized(this) {
            val currentAccessToken = runBlocking { sessionManager.getAccessToken() }
            val requestToken = response.request.header("Authorization")?.removePrefix("Bearer ")

            if (currentAccessToken != null && currentAccessToken != requestToken) {
                return response.request.newBuilder()
                    .header("Authorization", "Bearer $currentAccessToken")
                    .build()
            }

            val refreshRequestBody = json.encodeToString(
                RefreshTokenRequestDto.serializer(),
                RefreshTokenRequestDto(refreshToken = refreshToken)
            ).toRequestBody("application/json".toMediaType())

            val refreshRequest = Request.Builder()
                .url("${BuildConfig.API_BASE_URL}auth/refresh")
                .post(refreshRequestBody)
                .build()

            return try {
                val refreshResponse = okHttpClientProvider.get().newCall(refreshRequest).execute()
                if (refreshResponse.isSuccessful && refreshResponse.body != null) {
                    val responseBodyStr = refreshResponse.body!!.string()
                    val responseModel = json.decodeFromString<ResponseModel<TokenPairDto>>(responseBodyStr)
                    val newTokens = responseModel.data

                    if (newTokens != null) {
                        runBlocking {
                            sessionManager.saveAuthToken(newTokens.accessToken, newTokens.refreshToken)
                        }
                        response.request.newBuilder()
                            .header("Authorization", "Bearer ${newTokens.accessToken}")
                            .build()
                    } else {
                        runBlocking { sessionManager.clearSession() }
                        null
                    }
                } else {
                    runBlocking { sessionManager.clearSession() }
                    null
                }
            } catch (e: Exception) {
                runBlocking { sessionManager.clearSession() }
                null
            }
        }
    }
}
