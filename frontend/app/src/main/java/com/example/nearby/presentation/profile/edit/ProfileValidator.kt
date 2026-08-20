package com.example.nearby.presentation.profile.edit

object ProfileValidator {

    data class ValidationResult(
        val isValid: Boolean,
        val errorMessage: String? = null
    )

    fun validateProfile(name: String, email: String, phone: String): ValidationResult {
        if (name.trim().isEmpty()) {
            return ValidationResult(false, "Full Name cannot be empty.")
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches()) {
            return ValidationResult(false, "Please enter a valid email address.")
        }
        if (phone.trim().length < 7) {
            return ValidationResult(false, "Please enter a valid phone number.")
        }
        return ValidationResult(true)
    }

    fun calculatePasswordStrength(password: String): String {
        if (password.isEmpty()) return "None"
        var score = 0
        if (password.length >= 8) score++
        if (password.any { it.isUpperCase() }) score++
        if (password.any { it.isLowerCase() }) score++
        if (password.any { it.isDigit() }) score++
        if (password.any { !it.isLetterOrDigit() }) score++

        return when (score) {
            1, 2 -> "Weak"
            3 -> "Fair"
            4 -> "Good"
            5 -> "Strong / Excellent"
            else -> "Weak"
        }
    }
}
