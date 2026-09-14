package com.freefireesports.app.profile

import com.freefireesports.app.network.ApiClient
import com.freefireesports.app.network.ProfileDto
import com.freefireesports.app.network.UpdateProfileRequest

class ProfileRepository {
    private val api = ApiClient.profileApi

    suspend fun getProfile(): ProfileDto = api.getProfile()

    suspend fun updateProfile(request: UpdateProfileRequest): ProfileDto = api.updateProfile(request)
}
