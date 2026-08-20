package com.tourismguide.app.common.base

sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Content<out T>(val data: T) : UiState<T>()
    object Empty : UiState<Nothing>()
    data class Error(val message: String, val cause: Throwable? = null) : UiState<Nothing>()
    object Offline : UiState<Nothing>()
}
