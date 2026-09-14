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
import com.freefireesports.app.withdrawal.WithdrawalUiState
import com.freefireesports.app.withdrawal.WithdrawalViewModel

@Composable
fun WithdrawalScreen(
    onBack: () -> Unit,
    viewModel: WithdrawalViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val myRequests by viewModel.myRequests.collectAsState()

    var amount by remember { mutableStateOf("") }
    var upiId by remember { mutableStateOf("") }

    LaunchedEffect(Unit) { viewModel.loadMyRequests() }
    LaunchedEffect(uiState) {
        if (uiState is WithdrawalUiState.Submitted) {
            amount = ""
            upiId = ""
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        TextButton(onClick = onBack) { Text("← Back") }
        Text("Withdraw", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "The amount is reserved as soon as you submit, so it can't be spent twice. " +
                "The owner processes payouts manually — this isn't instant.",
            style = MaterialTheme.typography.bodyMedium,
        )
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = amount,
            onValueChange = { input -> amount = input.filter { it.isDigit() } },
            label = { Text("Amount (coins)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = upiId,
            onValueChange = { upiId = it },
            label = { Text("Your UPI ID") },
            placeholder = { Text("yourname@bank") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(modifier = Modifier.height(12.dp))
        Button(
            onClick = { viewModel.submit(amount.toIntOrNull() ?: 0, upiId) },
            enabled = (amount.toIntOrNull() ?: 0) > 0 && upiId.isNotBlank() && uiState !is WithdrawalUiState.Submitting,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Request Withdrawal")
        }

        if (uiState is WithdrawalUiState.Submitting) {
            Spacer(modifier = Modifier.height(12.dp))
            CircularProgressIndicator()
        }
        if (uiState is WithdrawalUiState.Submitted) {
            Spacer(modifier = Modifier.height(12.dp))
            Text("Withdrawal request submitted — the amount is now reserved.")
        }
        if (uiState is WithdrawalUiState.Error) {
            Spacer(modifier = Modifier.height(12.dp))
            Text((uiState as WithdrawalUiState.Error).message, color = MaterialTheme.colorScheme.error)
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Your requests", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        if (myRequests.isEmpty()) {
            Text("No withdrawal requests yet.")
        } else {
            myRequests.forEach { req ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text("${req.amount} coins → ${req.upiId}")
                    Text(req.status)
                }
            }
        }
    }
}
