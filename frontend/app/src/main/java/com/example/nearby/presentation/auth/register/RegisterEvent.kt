package com.example.nearby.presentation.auth.register

sealed class RegisterEvent {
    data class NameChanged(val name: String) : RegisterEvent()
    data class EmailChanged(val email: String) : RegisterEvent()
    data class PasswordChanged(val password: String) : RegisterEvent()
    data class ConfirmPasswordChanged(val confirm: String) : RegisterEvent()
    data class PhoneChanged(val phone: String) : RegisterEvent()
    object NextStep : RegisterEvent()
    object PreviousStep : RegisterEvent()
    object SubmitRegister : RegisterEvent()
}
