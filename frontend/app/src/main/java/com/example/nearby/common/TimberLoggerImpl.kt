package com.example.nearby.common

import com.example.nearby.BuildConfig
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TimberLoggerImpl @Inject constructor() : Logger {

    init {
        if (BuildConfig.ENABLE_LOGGING) {
            Timber.plant(Timber.DebugTree())
        }
    }

    override fun d(message: String, vararg args: Any?) {
        if (BuildConfig.ENABLE_LOGGING) {
            Timber.d(message, *args)
        }
    }

    override fun i(message: String, vararg args: Any?) {
        if (BuildConfig.ENABLE_LOGGING) {
            Timber.i(message, *args)
        }
    }

    override fun w(message: String, vararg args: Any?) {
        if (BuildConfig.ENABLE_LOGGING) {
            Timber.w(message, *args)
        }
    }

    override fun e(throwable: Throwable?, message: String, vararg args: Any?) {
        if (BuildConfig.ENABLE_LOGGING) {
            Timber.e(throwable, message, *args)
        }
    }

    override fun c(message: String, throwable: Throwable?) {
        Timber.e(throwable, "CRITICAL ERROR: %s", message)
    }
}
