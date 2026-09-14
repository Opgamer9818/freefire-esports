package com.freefireesports.app.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.POST

interface NotificationApi {
    @GET("notifications")
    suspend fun list(): List<NotificationDto>

    @POST("notifications/{id}/read")
    suspend fun markRead(@Path("id") id: String): NotificationDto

    @POST("notifications/read-all")
    suspend fun markAllRead()

    @PUT("notifications/fcm-token")
    suspend fun registerFcmToken(@Body body: FcmTokenBody)
}

data class NotificationDto(
    val id: String,
    val type: String,
    val title: String,
    val body: String,
    val readAt: String?,
    val createdAt: String,
)

data class FcmTokenBody(val token: String)
