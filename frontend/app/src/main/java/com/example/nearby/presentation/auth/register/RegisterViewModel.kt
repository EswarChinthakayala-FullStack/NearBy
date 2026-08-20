package com.example.nearby.presentation.auth.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.data.local.SessionManager
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.datasource.AuthRemoteDataSource
import com.tourismguide.app.data.remote.dto.RegisterRequest
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
class RegisterViewModel @Inject constructor(
    private val sessionManager: SessionManager,
    private val authRemoteDataSource: AuthRemoteDataSource
) : ViewModel() {

    private val _uiState = MutableStateFlow(RegisterUiState())
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()

    private val _effectFlow = MutableSharedFlow<RegisterEffect>()
    val effectFlow: SharedFlow<RegisterEffect> = _effectFlow.asSharedFlow()

    fun onEvent(event: RegisterEvent) {
        when (event) {
            is RegisterEvent.NameChanged -> _uiState.update { it.copy(name = event.name, errorMessage = null) }
            is RegisterEvent.EmailChanged -> _uiState.update { it.copy(email = event.email, errorMessage = null) }
            is RegisterEvent.PasswordChanged -> _uiState.update { it.copy(password = event.password, errorMessage = null) }
            is RegisterEvent.ConfirmPasswordChanged -> _uiState.update { it.copy(confirmPassword = event.confirm, errorMessage = null) }
            is RegisterEvent.PhoneChanged -> _uiState.update { it.copy(phone = event.phone, errorMessage = null) }
            is RegisterEvent.NextStep -> validateAndAdvanceStep()
            is RegisterEvent.PreviousStep -> _uiState.update { it.copy(currentStep = (it.currentStep - 1).coerceAtLeast(1)) }
            is RegisterEvent.SubmitRegister -> performRegistration()
        }
    }

    private fun validateAndAdvanceStep() {
        val state = _uiState.value
        when (state.currentStep) {
            1 -> {
                if (state.name.trim().isEmpty() || state.email.trim().isEmpty()) {
                    _uiState.update { it.copy(errorMessage = "Please enter your name and email address.") }
                    return
                }
                _uiState.update { it.copy(currentStep = 2, errorMessage = null) }
            }
            2 -> {
                if (state.password.length < 6) {
                    _uiState.update { it.copy(errorMessage = "Password must be at least 6 characters.") }
                    return
                }
                if (state.password != state.confirmPassword) {
                    _uiState.update { it.copy(errorMessage = "Passwords do not match.") }
                    return
                }
                _uiState.update { it.copy(currentStep = 3, errorMessage = null) }
            }
        }
    }

    private fun performRegistration() {
        val state = _uiState.value
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            val result = authRemoteDataSource.register(
                RegisterRequest(
                    name = state.name.trim(),
                    email = state.email.trim(),
                    password = state.password
                )
            )

            when (result) {
                is ApiResult.Success -> {
                    sessionManager.saveAuthToken(result.data.accessToken, result.data.refreshToken)
                    sessionManager.saveUserDetails(state.name.trim(), state.email.trim())
                    _uiState.update { it.copy(isLoading = false) }
                    _effectFlow.emit(RegisterEffect.NavigateToHome)
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
                    _uiState.update { it.copy(isLoading = false, errorMessage = result.throwable.localizedMessage ?: "Registration failed.") }
                }
                else -> {
                    _uiState.update { it.copy(isLoading = false, errorMessage = "Registration failed. Please try again.") }
                }
            }
        }
    }
}
