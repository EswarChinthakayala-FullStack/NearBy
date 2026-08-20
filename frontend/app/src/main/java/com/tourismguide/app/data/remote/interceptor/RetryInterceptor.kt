package com.tourismguide.app.data.remote.interceptor

import okhttp3.Interceptor
import okhttp3.Response

class RetryInterceptor(private val maxRetry: Int = 3) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()
        var response = chain.proceed(request)
        var tryCount = 0

        while (!response.isSuccessful && tryCount < maxRetry && response.code in 500..599) {
            tryCount++
            response.close()
            response = chain.proceed(request)
        }
        return response
    }
}
