package com.example.nearby.presentation.base

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.common.Logger
import com.example.nearby.common.UiEffect
import com.example.nearby.common.UiState
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch

abstract class BaseViewModel<STATE, EFFECT : UiEffect>(
    initialState: UiState<STATE>,
    protected val logger: Logger
) : ViewModel() {

    private val _uiState = MutableStateFlow(initialState)
    val uiState: StateFlow<UiState<STATE>> = _uiState.asStateFlow()

    private val _effectChannel = Channel<EFFECT>(Channel.BUFFERED)
    val uiEffect = _effectChannel.receiveAsFlow()

    protected val exceptionHandler = CoroutineExceptionHandler { _, throwable ->
        logger.e(throwable, "Uncaught Exception in ViewModel CoroutineScope")
        onError(throwable)
    }

    protected fun updateState(newState: UiState<STATE>) {
        _uiState.value = newState
    }

    protected fun sendEffect(effect: EFFECT) {
        viewModelScope.launch {
            _effectChannel.send(effect)
        }
    }

    protected fun launchWithHandler(
        block: suspend CoroutineScope.() -> Unit
    ) {
        viewModelScope.launch(exceptionHandler, block = block)
    }

    open fun onError(throwable: Throwable) {
        updateState(UiState.Error(message = throwable.message ?: "An unexpected error occurred", cause = throwable))
    }
}
