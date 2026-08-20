package com.tourismguide.app.domain.repository

import com.tourismguide.app.common.base.Resource
import com.tourismguide.app.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    suspend fun login(username: String, password: String): Resource<User>
    suspend fun register(fullName: String, email: String, phone: String, password: String): Resource<User>
    suspend fun logout(): Resource<Unit>
    fun getCurrentUser(): Flow<User?>
}
