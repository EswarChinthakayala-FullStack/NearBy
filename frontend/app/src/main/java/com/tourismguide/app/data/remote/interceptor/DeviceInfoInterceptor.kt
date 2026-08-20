package com.tourismguide.app.data.remote.interceptor

import android.os.Build
import com.tourismguide.app.data.remote.NetworkConstants
import okhttp3.Interceptor
import okhttp3.Response

class DeviceInfoInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val deviceInfo = "Android/${Build.VERSION.RELEASE} (${Build.MANUFACTURER} ${Build.MODEL})"
        val requestWithDevice = original.newBuilder()
            .header(NetworkConstants.HEADER_DEVICE_INFO, deviceInfo)
            .build()
        return chain.proceed(requestWithDevice)
    }
}
