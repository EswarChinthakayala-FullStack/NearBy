package com.example.nearby.presentation.auth.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.data.local.SessionManager
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.datasource.AuthRemoteDataSource
import com.tourismguide.app.data.remote.dto.LoginRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val sessionManager: SessionManager,
    private val authRemoteDataSource: AuthRemoteDataSource
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    private val _effectFlow = MutableSharedFlow<LoginEffect>()
    val effectFlow: SharedFlow<LoginEffect> = _effectFlow.asSharedFlow()

    fun onEvent(event: LoginEvent) {
        when (event) {
            is LoginEvent.EmailChanged -> _uiState.update { it.copy(email = event.email, errorMessage = null) }
            is LoginEvent.PasswordChanged -> _uiState.update { it.copy(password = event.password, errorMessage = null) }
            is LoginEvent.SubmitLogin -> performLogin()
        }
    }

    private fun performLogin() {
        val email = _uiState.value.email.trim()
        val password = _uiState.value.password

        if (email.isEmpty() || password.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Please enter your email and password.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            val result = authRemoteDataSource.login(
                LoginRequest(email = email, password = password)
            )

            when (result) {
                is ApiResult.Success -> {
                    sessionManager.saveAuthToken(result.data.accessToken, result.data.refreshToken)
                    val derivedName = email.substringBefore("@").replace(".", " ").capitalize()
                    sessionManager.saveUserDetails(derivedName, email)
                    _uiState.update { it.copy(isLoading = false) }
                    _effectFlow.emit(LoginEffect.NavigateToHome)
                }
                is ApiResult.Unauthorized -> {
                    _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
                }
                is ApiResult.Forbidden -> {
                    _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
                }
                is ApiResult.ValidationError -> {
                    _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
                }
                is ApiResult.ServerError -> {
                    _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
                }
                is ApiResult.NetworkError -> {
                    _uiState.update { it.copy(isLoading = false, errorMessage = "Network connection failed. Ensure backend server is running.") }
                }
                is ApiResult.UnknownError -> {
                    _uiState.update { it.copy(isLoading = false, errorMessage = result.throwable.localizedMessage ?: "An unexpected error occurred.") }
                }
                else -> {
                    _uiState.update { it.copy(isLoading = false, errorMessage = "Login failed. Please check your credentials.") }
                }
            }
        }
    }
}
