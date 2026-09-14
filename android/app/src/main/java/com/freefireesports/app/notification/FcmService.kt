package com.freefireesports.app.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.freefireesports.app.MainActivity
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class FcmService : FirebaseMessagingService() {

    private val scope = CoroutineScope(Dispatchers.IO)

    // Firebase calls this whenever a token is issued or refreshed —
    // including the very first time, so this alone is enough to keep the
    // backend's copy current without any extra "did I already send this"
    // bookkeeping on our side.
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        scope.launch {
            try {
                NotificationRepository().registerFcmToken(token)
            } catch (_: Exception) {
                // Not fatal — the next token refresh (or next app open,
                // once we add a resend-on-launch hook) will retry.
            }
        }
    }

    // Only fires while the app is in the foreground — background/killed
    // delivery of "notification"-type payloads is handled by the system
    // automatically, which is why the backend sends a plain
    // `notification` payload rather than a data-only one.
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        val title = message.notification?.title ?: return
        val body = message.notification?.body ?: return
        showNotification(title, body)
    }

    private fun showNotification(title: String, body: String) {
        val channelId = "ff_esports_default"
        val manager = getSystemService(NotificationManager::class.java)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "General", NotificationManager.IMPORTANCE_DEFAULT)
            manager.createNotificationChannel(channel)
        }

        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setSmallIcon(android.R.drawable.ic_dialog_info) // swap for a branded icon later
            .build()

        manager.notify(System.currentTimeMillis().toInt(), notification)
    }
}
