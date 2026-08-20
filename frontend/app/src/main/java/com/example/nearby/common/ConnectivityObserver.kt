package com.example.nearby.common

import kotlinx.coroutines.flow.Flow

interface ConnectivityObserver {
    enum class Status {
        Available, Unavailable, Losing, Lost
    }

    fun observe(): Flow<Status>
    fun isConnected(): Boolean
}
