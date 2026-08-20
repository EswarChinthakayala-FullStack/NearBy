package com.tourismguide.app.domain.validation

object EmailValidator {
    private const val EMAIL_REGEX = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$"

    fun isValid(email: String): Boolean {
        return email.isNotBlank() && Regex(EMAIL_REGEX).matches(email.trim())
    }
}

object PasswordValidator {
    fun isValid(password: String): Boolean {
        return password.length >= 6
    }
}

object PhoneValidator {
    fun isValid(phone: String): Boolean {
        return phone.isBlank() || phone.length >= 10
    }
}
