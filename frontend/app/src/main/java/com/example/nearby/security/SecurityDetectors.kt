package com.example.nearby.security

import android.os.Build
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

interface RootDetector {
    fun isDeviceRooted(): Boolean
}

interface EmulatorDetector {
    fun isEmulator(): Boolean
}

@Singleton
class RootDetectorImpl @Inject constructor() : RootDetector {
    override fun isDeviceRooted(): Boolean {
        val paths = arrayOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su"
        )
        for (path in paths) {
            if (File(path).exists()) return true
        }
        return false
    }
}

@Singleton
class EmulatorDetectorImpl @Inject constructor() : EmulatorDetector {
    override fun isEmulator(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")
                || "google_sdk" == Build.PRODUCT)
    }
}
