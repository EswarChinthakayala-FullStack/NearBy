package com.tourismguide.app.data.remote.interceptor

import com.tourismguide.app.data.remote.NetworkConstants
import okhttp3.Interceptor
import okhttp3.Response
import java.util.UUID

class RequestIdInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val requestWithId = original.newBuilder()
            .header(NetworkConstants.HEADER_REQUEST_ID, UUID.randomUUID().toString())
            .build()
        return chain.proceed(requestWithId)
    }
}
