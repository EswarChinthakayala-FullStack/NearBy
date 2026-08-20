package com.example.nearby.presentation.reviewform

data class ReviewUiState(
    val rating: Float = 5.0f,
    val reviewText: String = "",
    val attachedPhotos: List<String> = emptyList(),
    val isAnonymous: Boolean = false,
    val isSubmitting: Boolean = false,
    val isSuccess: Boolean = false,
    val errorMessage: String? = null
)
