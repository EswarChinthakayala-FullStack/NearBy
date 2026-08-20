package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserDto(
    @SerialName("id") val id: String = "",
    @SerialName("uuid") val uuid: String = "",
    @SerialName("full_name") val fullName: String = "",
    @SerialName("email") val email: String = "",
    @SerialName("username") val username: String? = null,
    @SerialName("phone") val phone: String? = null,
    @SerialName("phone_number") val phoneNumber: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    @SerialName("profile_image") val profileImage: String? = null,
    @SerialName("bio") val bio: String? = null,
    @SerialName("gender") val gender: String? = null,
    @SerialName("date_of_birth") val dateOfBirth: String? = null,
    @SerialName("country") val country: String? = null,
    @SerialName("state") val state: String? = null,
    @SerialName("city") val city: String? = null,
    @SerialName("preferred_language") val preferredLanguage: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("joined_at") val joinedAt: String? = null,
    @SerialName("is_verified") val isVerified: Boolean = false,
    @SerialName("email_verified") val emailVerified: Boolean = true,
    @SerialName("phone_verified") val phoneVerified: Boolean = false
) {
    val resolvedUuid: String get() = if (uuid.isNotBlank()) uuid else id
    val resolvedPhone: String get() = phone ?: phoneNumber ?: ""
    val resolvedAvatarUrl: String? get() = avatarUrl ?: profileImage
    val resolvedJoinedAt: String get() = joinedAt ?: createdAt ?: ""
}

@Serializable
data class UserUpdateDto(
    @SerialName("full_name") val fullName: String? = null,
    @SerialName("username") val username: String? = null,
    @SerialName("phone") val phone: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    @SerialName("bio") val bio: String? = null,
    @SerialName("gender") val gender: String? = null,
    @SerialName("date_of_birth") val dateOfBirth: String? = null,
    @SerialName("country") val country: String? = null,
    @SerialName("state") val state: String? = null,
    @SerialName("city") val city: String? = null,
    @SerialName("preferred_language") val preferredLanguage: String? = null
)

@Serializable
data class ChangePasswordDto(
    @SerialName("current_password") val currentPassword: String,
    @SerialName("new_password") val newPassword: String
)
