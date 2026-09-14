package com.freefireesports.app.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT

interface ProfileApi {
    @GET("profile")
    suspend fun getProfile(): ProfileDto

    @PUT("profile")
    suspend fun updateProfile(@Body body: UpdateProfileRequest): ProfileDto
}

// Mirrors what ProfileController returns on the backend.
data class ProfileDto(
    val id: String,
    val userId: String,
    val displayName: String?,
    val fullName: String?,
    val avatarUrl: String?,
    val ffUid: String?,
    val ffIgn: String?,
    val whatsappNumber: String?,
    val country: String?,
    val themePreference: String,
    val notificationsEnabled: Boolean,
    val email: String?,
    val phone: String?,
    val role: String,
)

// Mirrors UpdateProfileDto on the backend. Nulls are omitted by Gson by
// default only if you configure it to — to keep this simple, only send
// fields you actually want to change.
data class UpdateProfileRequest(
    val displayName: String? = null,
    val fullName: String? = null,
    val ffUid: String? = null,
    val ffIgn: String? = null,
    val whatsappNumber: String? = null,
    val country: String? = null,
    val themePreference: String? = null,
    val notificationsEnabled: Boolean? = null,
)
