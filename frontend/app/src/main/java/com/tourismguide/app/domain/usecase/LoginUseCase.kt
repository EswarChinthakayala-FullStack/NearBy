package com.tourismguide.app.domain.usecase

import com.tourismguide.app.common.base.Resource
import com.tourismguide.app.domain.model.User
import com.tourismguide.app.domain.repository.AuthRepository
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(email: String, password: String): Resource<User> {
        if (email.isBlank() || password.isBlank()) {
            return Resource.Error("Email and password cannot be empty.")
        }
        return authRepository.login(email, password)
    }
}

class RegisterUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(fullName: String, email: String, phone: String, password: String): Resource<User> {
        if (fullName.isBlank() || email.isBlank() || password.isBlank()) {
            return Resource.Error("Please fill out all required fields.")
        }
        return authRepository.register(fullName, email, phone, password)
    }
}
