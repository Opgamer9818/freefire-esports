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
import androidx.compose.material3.FilterChip
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
import com.freefireesports.app.support.SupportUiState
import com.freefireesports.app.support.SupportViewModel

private val categories = listOf("PAYMENT", "TOURNAMENT", "WITHDRAWAL", "REDEEM", "ACCOUNT", "GENERAL")

@Composable
fun SupportScreen(
    onBack: () -> Unit,
    viewModel: SupportViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val tickets by viewModel.myTickets.collectAsState()
    var category by remember { mutableStateOf("GENERAL") }
    var message by remember { mutableStateOf("") }

    LaunchedEffect(Unit) { viewModel.loadMyTickets() }
    LaunchedEffect(uiState) {
        if (uiState is SupportUiState.Submitted) message = ""
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        TextButton(onClick = onBack) { Text("← Back") }
        Text("Support", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(12.dp))

        Text("Category", style = MaterialTheme.typography.titleSmall)
        Spacer(modifier = Modifier.height(4.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            categories.take(3).forEach { c ->
                FilterChip(selected = category == c, onClick = { category = c }, label = { Text(c) })
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            categories.drop(3).forEach { c ->
                FilterChip(selected = category == c, onClick = { category = c }, label = { Text(c) })
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = message,
            onValueChange = { message = it },
            label = { Text("How can we help?") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 4,
        )
        Spacer(modifier = Modifier.height(12.dp))
        Button(
            onClick = { viewModel.submit(category, message) },
            enabled = message.length >= 5 && uiState !is SupportUiState.Submitting,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Submit")
        }

        if (uiState is SupportUiState.Submitting) {
            Spacer(modifier = Modifier.height(12.dp))
            CircularProgressIndicator()
        }
        if (uiState is SupportUiState.Submitted) {
            Spacer(modifier = Modifier.height(12.dp))
            Text("Your ticket has been received — we'll follow up soon.")
        }
        if (uiState is SupportUiState.Error) {
            Spacer(modifier = Modifier.height(12.dp))
            Text((uiState as SupportUiState.Error).message, color = MaterialTheme.colorScheme.error)
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Your tickets", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        if (tickets.isEmpty()) {
            Text("No support tickets yet.")
        } else {
            tickets.forEach { t ->
                Column(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(t.category, style = MaterialTheme.typography.labelMedium)
                        Text(t.status, style = MaterialTheme.typography.labelMedium)
                    }
                    Text(t.message, style = MaterialTheme.typography.bodyMedium)
                    t.adminResponse?.let {
                        Text("Reply: $it", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}
