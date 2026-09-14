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
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.freefireesports.app.tournament.RegistrationFlowState
import com.freefireesports.app.tournament.TournamentDetailViewModel

@Composable
fun TournamentDetailScreen(
    tournamentId: String,
    onNeedsTeam: (String) -> Unit,
    onRegistered: () -> Unit,
    onBack: () -> Unit,
    viewModel: TournamentDetailViewModel = viewModel(),
) {
    val tournament by viewModel.tournament.collectAsState()
    val flowState by viewModel.flowState.collectAsState()

    LaunchedEffect(tournamentId) { viewModel.load(tournamentId) }

    LaunchedEffect(flowState) {
        if (flowState is RegistrationFlowState.Registered) onRegistered()
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp).verticalScroll(rememberScrollState()),
    ) {
        TextButton(onClick = onBack) { Text("← Back") }

        val t = tournament
        if (t == null) {
            Spacer(modifier = Modifier.height(48.dp))
            CircularProgressIndicator()
            return@Column
        }

        Text(t.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(4.dp))
        Text("${t.format} · ${t.status.replace('_', ' ')}", style = MaterialTheme.typography.bodyMedium)
        Spacer(modifier = Modifier.height(16.dp))

        InfoRow("Entry fee", if (t.isFree) "Free" else "${t.entryFeeCoins} coins")
        InfoRow("Prize pool", "${t.prizePool} coins")
        InfoRow("Slots", "${t.slotsFilled} / ${t.slots}")
        InfoRow("Date", t.date.take(10))

        t.rules?.let { rules ->
            Spacer(modifier = Modifier.height(16.dp))
            Text("Rules", style = MaterialTheme.typography.titleMedium)
            Text(rules, style = MaterialTheme.typography.bodyMedium)
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                if (t.format == "SOLO") viewModel.registerSolo(t.id) else onNeedsTeam(t.id)
            },
            enabled = flowState !is RegistrationFlowState.InProgress && t.status == "REGISTRATION_OPEN",
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(if (t.format == "SOLO") "Join Tournament" else "Create / Join Team")
        }

        if (t.status != "REGISTRATION_OPEN") {
            Spacer(modifier = Modifier.height(8.dp))
            Text("Registration isn't open for this tournament right now.", style = MaterialTheme.typography.bodySmall)
        }

        if (flowState is RegistrationFlowState.InProgress) {
            Spacer(modifier = Modifier.height(16.dp))
            CircularProgressIndicator()
        }
        if (flowState is RegistrationFlowState.Error) {
            Spacer(modifier = Modifier.height(16.dp))
            Text((flowState as RegistrationFlowState.Error).message, color = MaterialTheme.colorScheme.error)
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium)
        Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
    }
}
