package com.example.nearby.presentation.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.security.SecureStorage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val secureStorage: SecureStorage
) : ViewModel() {

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    init {
        checkSession()
    }

    fun checkSession() {
        viewModelScope.launch {
            val token = secureStorage.getAccessToken()
            _uiState.value = _uiState.value.copy(isLoggedIn = !token.isNullOrEmpty())
        }
    }

    fun updateOfflineStatus(isOffline: Boolean) {
        _uiState.value = _uiState.value.copy(isOffline = isOffline)
    }

    fun updateDestination(destinationId: Int) {
        _uiState.value = _uiState.value.copy(currentDestinationId = destinationId)
    }
}
