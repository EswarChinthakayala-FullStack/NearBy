package com.example.nearby.network.interceptors

import com.example.nearby.common.ConnectivityObserver
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

class NoNetworkException(message: String = "No network connection available") : IOException(message)

@Singleton
class ConnectivityInterceptor @Inject constructor(
    private val connectivityObserver: ConnectivityObserver
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        if (!connectivityObserver.isConnected()) {
            throw NoNetworkException()
        }
        return chain.proceed(chain.request())
    }
}

@Singleton
class RequestIdInterceptor @Inject constructor() : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .addHeader("X-Request-ID", UUID.randomUUID().toString())
            .addHeader("Accept", "application/json")
            .build()
        return chain.proceed(request)
    }
}
