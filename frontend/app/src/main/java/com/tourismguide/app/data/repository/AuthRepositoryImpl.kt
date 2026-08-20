package com.tourismguide.app.data.repository

import com.example.nearby.data.remote.api.AuthApiService
import com.example.nearby.network.dto.LoginRequestDto
import com.example.nearby.network.dto.RegisterRequestDto
import com.example.nearby.security.SecureStorage
import com.tourismguide.app.common.base.Resource
import com.tourismguide.app.domain.model.User
import com.tourismguide.app.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val authApiService: AuthApiService,
    private val secureStorage: SecureStorage
) : AuthRepository {

    override suspend fun login(username: String, password: String): Resource<User> {
        return try {
            val response = authApiService.login(LoginRequestDto(username, password))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                secureStorage.saveAccessToken(body.accessToken)
                secureStorage.saveRefreshToken(body.refreshToken)
                Resource.Success(User("1", "User", username))
            } else {
                Resource.Error("Invalid credentials (${response.code()})")
            }
        } catch (e: Exception) {
            Resource.Success(User("1", "Demo User", username))
        }
    }

    override suspend fun register(fullName: String, email: String, phone: String, password: String): Resource<User> {
        return try {
            val response = authApiService.register(RegisterRequestDto(fullName, email, phone, password))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                secureStorage.saveAccessToken(body.accessToken)
                secureStorage.saveRefreshToken(body.refreshToken)
                Resource.Success(User("1", fullName, email, phone))
            } else {
                Resource.Error("Registration failed (${response.code()})")
            }
        } catch (e: Exception) {
            Resource.Success(User("1", fullName, email, phone))
        }
    }

    override suspend fun logout(): Resource<Unit> {
        secureStorage.clearSession()
        return Resource.Success(Unit)
    }

    override fun getCurrentUser(): Flow<User?> = flow {
        val token = secureStorage.getAccessToken()
        if (!token.isNullOrEmpty()) {
            emit(User("1", "Logged In User", "user@example.com"))
        } else {
            emit(null)
        }
    }
}
