package com.example.nearby.presentation.reviewform

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReviewViewModel @Inject constructor() : ViewModel() {

    private val _uiState = MutableStateFlow(ReviewUiState())
    val uiState: StateFlow<ReviewUiState> = _uiState.asStateFlow()

    fun updateRating(rating: Float) {
        _uiState.update { it.copy(rating = rating, errorMessage = null) }
    }

    fun updateText(text: String) {
        _uiState.update { it.copy(reviewText = text, errorMessage = null) }
    }

    fun addPhoto(photoUrl: String) {
        val updated = _uiState.value.attachedPhotos + photoUrl
        _uiState.update { it.copy(attachedPhotos = updated) }
    }

    fun removePhoto(index: Int) {
        val updated = _uiState.value.attachedPhotos.toMutableList().apply {
            if (index in indices) removeAt(index)
        }
        _uiState.update { it.copy(attachedPhotos = updated) }
    }

    fun toggleAnonymous(isAnonymous: Boolean) {
        _uiState.update { it.copy(isAnonymous = isAnonymous) }
    }

    fun submitReview(onSuccess: () -> Unit) {
        val validation = ReviewValidator.validate(_uiState.value.rating, _uiState.value.reviewText)
        if (!validation.isValid) {
            _uiState.update { it.copy(errorMessage = validation.errorMessage) }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
            delay(1000)
            _uiState.update { it.copy(isSubmitting = false, isSuccess = true) }
            onSuccess()
        }
    }
}
