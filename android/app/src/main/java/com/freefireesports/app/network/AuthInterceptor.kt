package com.freefireesports.app.network

import com.google.android.gms.tasks.Tasks
import com.google.firebase.auth.FirebaseAuth
import okhttp3.Interceptor
import okhttp3.Response
import java.util.concurrent.TimeUnit

// Runs on OkHttp's background dispatcher (never the main thread), so it's
// safe to block briefly here while fetching a fresh Firebase ID token.
// This is what makes the backend's FirebaseAuthGuard able to identify
// every request without the rest of the app ever touching tokens directly.
class AuthInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val user = FirebaseAuth.getInstance().currentUser
        val original = chain.request()

        if (user == null) {
            return chain.proceed(original)
        }

        val token = try {
            Tasks.await(user.getIdToken(false), 10, TimeUnit.SECONDS)?.token
        } catch (e: Exception) {
            null
        }

        val authorized = if (token != null) {
            original.newBuilder().addHeader("Authorization", "Bearer $token").build()
        } else {
            original
        }

        return chain.proceed(authorized)
    }
}
