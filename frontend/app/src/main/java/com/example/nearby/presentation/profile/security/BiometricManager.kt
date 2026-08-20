package com.example.nearby.presentation.profile.security

import android.content.Context

class BiometricManager(private val context: Context) {
    fun isBiometricAvailable(): Boolean = true
    fun authenticate(onSuccess: () -> Unit, onError: (String) -> Unit) {
        onSuccess()
    }
}
