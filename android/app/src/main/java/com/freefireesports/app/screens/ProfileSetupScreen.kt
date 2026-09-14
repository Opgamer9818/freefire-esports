package com.freefireesports.app.screens

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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.freefireesports.app.network.UpdateProfileRequest
import com.freefireesports.app.profile.ProfileUiState
import com.freefireesports.app.profile.ProfileViewModel

@Composable
fun ProfileSetupScreen(
    onSaved: () -> Unit,
    viewModel: ProfileViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadProfile() }

    var displayName by remember { mutableStateOf("") }
    var ffUid by remember { mutableStateOf("") }
    var ffIgn by remember { mutableStateOf("") }
    var whatsapp by remember { mutableStateOf("") }
    var prefilled by remember { mutableStateOf(false) }
    var hasSubmitted by remember { mutableStateOf(false) }

    if (uiState is ProfileUiState.Loaded && !prefilled) {
        val profile = (uiState as ProfileUiState.Loaded).profile
        displayName = profile.displayName ?: ""
        ffUid = profile.ffUid ?: ""
        ffIgn = profile.ffIgn ?: ""
        whatsapp = profile.whatsappNumber ?: ""
        prefilled = true
    }

    // Only navigate forward once WE triggered a save and it came back
    // Loaded — not on the very first load of an existing profile.
    LaunchedEffect(uiState) {
        if (hasSubmitted && uiState is ProfileUiState.Loaded) onSaved()
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(modifier = Modifier.height(32.dp))
        Text("Set up your profile", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(24.dp))

        when (uiState) {
            is ProfileUiState.Loading -> CircularProgressIndicator()
            else -> {
                OutlinedTextField(
                    value = displayName,
                    onValueChange = { displayName = it },
                    label = { Text("Display name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = ffUid,
                    onValueChange = { ffUid = it },
                    label = { Text("Free Fire UID") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = ffIgn,
                    onValueChange = { ffIgn = it },
                    label = { Text("Free Fire IGN") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = whatsapp,
                    onValueChange = { whatsapp = it },
                    label = { Text("WhatsApp number (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = {
                        hasSubmitted = true
                        viewModel.saveProfile(
                            UpdateProfileRequest(
                                displayName = displayName.ifBlank { null },
                                ffUid = ffUid.ifBlank { null },
                                ffIgn = ffIgn.ifBlank { null },
                                whatsappNumber = whatsapp.ifBlank { null },
                            ),
                        )
                    },
                    enabled = ffUid.isNotBlank() && ffIgn.isNotBlank() && uiState !is ProfileUiState.Saving,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Save & Continue")
                }
            }
        }

        if (uiState is ProfileUiState.Error) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = (uiState as ProfileUiState.Error).message, color = MaterialTheme.colorScheme.error)
        }
    }
}
