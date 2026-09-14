package com.freefireesports.app.screens

import android.app.Activity
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.freefireesports.app.auth.AuthUiState
import com.freefireesports.app.auth.AuthViewModel

@Composable
fun PhoneAuthScreen(
    authViewModel: AuthViewModel,
    onSignedIn: () -> Unit,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val uiState by authViewModel.uiState.collectAsState()

    var phoneNumber by remember { mutableStateOf("+91") }
    var otp by remember { mutableStateOf("") }

    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.SignedIn) onSignedIn()
    }

    val otpState = uiState as? AuthUiState.OtpSent

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(modifier = Modifier.height(48.dp))

        if (otpState == null) {
            Text("Enter your phone number", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = phoneNumber,
                onValueChange = { phoneNumber = it },
                label = { Text("Phone number (with country code)") },
                placeholder = { Text("+91XXXXXXXXXX") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = { activity?.let { authViewModel.sendOtp(phoneNumber, it) } },
                enabled = uiState !is AuthUiState.Loading && phoneNumber.length >= 8,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Send OTP")
            }
        } else {
            Text("Enter the OTP sent to $phoneNumber", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = otp,
                onValueChange = { otp = it },
                label = { Text("6-digit code") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = { authViewModel.verifyOtp(otpState.verificationId, otp) },
                enabled = uiState !is AuthUiState.Loading && otp.length == 6,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Verify & Continue")
            }
        }

        if (uiState is AuthUiState.Loading) {
            Spacer(modifier = Modifier.height(24.dp))
            CircularProgressIndicator()
        }

        if (uiState is AuthUiState.Error) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = (uiState as AuthUiState.Error).message, color = MaterialTheme.colorScheme.error)
        }

        Spacer(modifier = Modifier.height(24.dp))
        TextButton(onClick = onBack) { Text("Back") }
    }
}
