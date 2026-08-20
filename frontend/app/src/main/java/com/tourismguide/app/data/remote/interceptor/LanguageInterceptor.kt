package com.tourismguide.app.data.remote.interceptor

import com.tourismguide.app.data.remote.NetworkConstants
import okhttp3.Interceptor
import okhttp3.Response
import java.util.Locale

class LanguageInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val language = Locale.getDefault().toLanguageTag()
        val requestWithLang = original.newBuilder()
            .header(NetworkConstants.HEADER_ACCEPT_LANGUAGE, language)
            .build()
        return chain.proceed(requestWithLang)
    }
}
