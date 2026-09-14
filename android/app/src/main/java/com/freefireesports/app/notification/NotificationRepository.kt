package com.freefireesports.app.notification

import com.freefireesports.app.network.ApiClient
import com.freefireesports.app.network.FcmTokenBody

class NotificationRepository {
    private val api = ApiClient.notificationApi

    suspend fun list() = api.list()

    suspend fun markRead(id: String) = api.markRead(id)

    suspend fun markAllRead() = api.markAllRead()

    suspend fun registerFcmToken(token: String) = api.registerFcmToken(FcmTokenBody(token))
}
