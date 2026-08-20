package com.example.nearby.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore by preferencesDataStore(name = "user_session")

@Singleton
class SessionManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val keyAccessToken = stringPreferencesKey("access_token")
    private val keyRefreshToken = stringPreferencesKey("refresh_token")
    private val keyUserEmail = stringPreferencesKey("user_email")
    private val keyUserName = stringPreferencesKey("user_name")

    suspend fun saveAuthToken(accessToken: String, refreshToken: String) {
        context.dataStore.edit { prefs ->
            prefs[keyAccessToken] = accessToken
            prefs[keyRefreshToken] = refreshToken
        }
    }

    suspend fun saveUserDetails(name: String, email: String) {
        context.dataStore.edit { prefs ->
            prefs[keyUserName] = name
            prefs[keyUserEmail] = email
        }
    }

    suspend fun getUserName(): String? {
        val prefs = context.dataStore.data.first()
        return prefs[keyUserName]
    }

    suspend fun getUserEmail(): String? {
        val prefs = context.dataStore.data.first()
        return prefs[keyUserEmail]
    }

    suspend fun getAccessToken(): String? {
        val prefs = context.dataStore.data.first()
        return prefs[keyAccessToken]
    }

    suspend fun getRefreshToken(): String? {
        val prefs = context.dataStore.data.first()
        return prefs[keyRefreshToken]
    }

    suspend fun isLoggedIn(): Boolean {
        val token = getAccessToken()
        return !token.isNullOrEmpty()
    }

    suspend fun clearSession() {
        context.dataStore.edit { prefs ->
            prefs.clear()
        }
    }
}
