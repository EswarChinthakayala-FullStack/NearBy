package com.example.nearby.presentation.splash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.data.local.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SplashViewModel @Inject constructor(
    private val sessionManager: SessionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<SplashUiState>(SplashUiState.Initial)
    val uiState: StateFlow<SplashUiState> = _uiState.asStateFlow()

    init {
        verifySession()
    }

    fun verifySession() {
        viewModelScope.launch {
            _uiState.value = SplashUiState.Verifying
            delay(1000) // Smooth splash animation duration
            val isLoggedIn = sessionManager.isLoggedIn()
            if (isLoggedIn) {
                _uiState.value = SplashUiState.Authenticated
            } else {
                _uiState.value = SplashUiState.Unauthenticated
            }
        }
    }
}
