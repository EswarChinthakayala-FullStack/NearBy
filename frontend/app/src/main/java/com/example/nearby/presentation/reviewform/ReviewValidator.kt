package com.example.nearby.presentation.reviewform

object ReviewValidator {

    data class ValidationResult(
        val isValid: Boolean,
        val errorMessage: String? = null
    )

    fun validate(rating: Float, reviewText: String): ValidationResult {
        if (rating <= 0f) {
            return ValidationResult(false, "Please select a star rating.")
        }
        val trimmed = reviewText.trim()
        if (trimmed.length < 10) {
            return ValidationResult(false, "Please write at least 10 characters in your review.")
        }
        return ValidationResult(true)
    }
}
