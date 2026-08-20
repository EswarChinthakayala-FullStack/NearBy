package com.tourismguide.app.data.remote

import com.example.nearby.BuildConfig

object ApiConfig {
    val baseUrl: String get() = BuildConfig.API_BASE_URL
    val mapStyleUrl: String get() = BuildConfig.MAP_STYLE_URL
    val isLoggingEnabled: Boolean get() = BuildConfig.ENABLE_LOGGING
}
