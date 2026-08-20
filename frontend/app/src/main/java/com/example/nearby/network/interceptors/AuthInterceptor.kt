package com.example.nearby.network.interceptors

import com.example.nearby.data.local.SessionManager
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val sessionManager: SessionManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        if (originalRequest.header("No-Authentication") != null) {
            val newRequest = originalRequest.newBuilder()
                .removeHeader("No-Authentication")
                .build()
            return chain.proceed(newRequest)
        }

        val token = runBlocking { sessionManager.getAccessToken() }
        val requestBuilder = originalRequest.newBuilder()

        if (!token.isNullOrEmpty()) {
            requestBuilder.header("Authorization", "Bearer $token")
        }

        return chain.proceed(requestBuilder.build())
    }
}
