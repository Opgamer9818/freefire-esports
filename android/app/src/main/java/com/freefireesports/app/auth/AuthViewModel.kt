package com.freefireesports.app.auth

import android.app.Activity
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AuthUiState {
    data object SignedOut : AuthUiState()
    data object Loading : AuthUiState()
    data class OtpSent(val verificationId: String) : AuthUiState()
    data object SignedIn : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AuthViewModel(private val repository: AuthRepository = AuthRepository()) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(
        if (repository.currentUser != null) AuthUiState.SignedIn else AuthUiState.SignedOut,
    )
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun signInWithGoogle(context: Context, webClientId: String) {
        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            repository.signInWithGoogle(context, webClientId)
                .onSuccess { _uiState.value = AuthUiState.SignedIn }
                .onFailure { _uiState.value = AuthUiState.Error(it.message ?: "Google sign-in failed") }
        }
    }

    fun sendOtp(phoneNumber: String, activity: Activity) {
        _uiState.value = AuthUiState.Loading
        repository.sendOtp(
            phoneNumber = phoneNumber,
            activity = activity,
            onCodeSent = { verificationId -> _uiState.value = AuthUiState.OtpSent(verificationId) },
            onAutoVerified = { _uiState.value = AuthUiState.SignedIn },
            onError = { _uiState.value = AuthUiState.Error(it.message ?: "Could not send OTP") },
        )
    }

    fun verifyOtp(verificationId: String, code: String) {
        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            repository.verifyOtp(verificationId, code)
                .onSuccess { _uiState.value = AuthUiState.SignedIn }
                .onFailure { _uiState.value = AuthUiState.Error(it.message ?: "Invalid code") }
        }
    }

    fun signOut() {
        repository.signOut()
        _uiState.value = AuthUiState.SignedOut
    }
}
