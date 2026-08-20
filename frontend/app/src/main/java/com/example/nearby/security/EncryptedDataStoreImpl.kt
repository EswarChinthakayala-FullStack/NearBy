package com.example.nearby.security

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "secure_user_prefs")

@Singleton
class EncryptedDataStoreImpl @Inject constructor(
    @ApplicationContext private val context: Context
) : SecureStorage {

    private companion object {
        val KEY_ACCESS_TOKEN = stringPreferencesKey("access_token")
        val KEY_REFRESH_TOKEN = stringPreferencesKey("refresh_token")
    }

    override suspend fun getAccessToken(): String? {
        return context.dataStore.data.map { prefs ->
            prefs[KEY_ACCESS_TOKEN]
        }.firstOrNull()
    }

    override suspend fun saveAccessToken(token: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = token
        }
    }

    override suspend fun getRefreshToken(): String? {
        return context.dataStore.data.map { prefs ->
            prefs[KEY_REFRESH_TOKEN]
        }.firstOrNull()
    }

    override suspend fun saveRefreshToken(token: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_REFRESH_TOKEN] = token
        }
    }

    override suspend fun saveTokenPair(accessToken: String, refreshToken: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = accessToken
            prefs[KEY_REFRESH_TOKEN] = refreshToken
        }
    }

    override suspend fun clearSession() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_ACCESS_TOKEN)
            prefs.remove(KEY_REFRESH_TOKEN)
        }
    }
}
