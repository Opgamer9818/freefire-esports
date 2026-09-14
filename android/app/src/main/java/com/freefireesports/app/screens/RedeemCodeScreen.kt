package com.freefireesports.app.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.freefireesports.app.redeem.RedeemUiState
import com.freefireesports.app.redeem.RedeemViewModel

@Composable
fun RedeemCodeScreen(
    onBack: () -> Unit,
    viewModel: RedeemViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val myRequests by viewModel.myRequests.collectAsState()
    var code by remember { mutableStateOf("") }

    LaunchedEffect(Unit) { viewModel.loadMyRequests() }
    LaunchedEffect(uiState) {
        if (uiState is RedeemUiState.Submitted) code = ""
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        TextButton(onClick = onBack) { Text("← Back") }
        Text("Redeem Code", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Enter a Google Play redeem code. The owner verifies it manually and " +
                "credits the matching coin value — the app doesn't set the value for you.",
            style = MaterialTheme.typography.bodyMedium,
        )
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = code,
            onValueChange = { code = it },
            label = { Text("Redeem code") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(modifier = Modifier.height(12.dp))
        Button(
            onClick = { viewModel.submitCode(code) },
            enabled = code.isNotBlank() && uiState !is RedeemUiState.Submitting,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Submit")
        }

        if (uiState is RedeemUiState.Submitting) {
            Spacer(modifier = Modifier.height(12.dp))
            CircularProgressIndicator()
        }
        if (uiState is RedeemUiState.Submitted) {
            Spacer(modifier = Modifier.height(12.dp))
            Text("Your redeem-code request has been received. Please wait while it's checked.")
        }
        if (uiState is RedeemUiState.Error) {
            Spacer(modifier = Modifier.height(12.dp))
            Text((uiState as RedeemUiState.Error).message, color = MaterialTheme.colorScheme.error)
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Your requests", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        if (myRequests.isEmpty()) {
            Text("No redeem requests yet.")
        } else {
            myRequests.forEach { req ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(req.createdAt.take(10))
                    Text(if (req.approvedCoins != null) "${req.status} · ${req.approvedCoins} coins" else req.status)
                }
            }
        }
    }
}
