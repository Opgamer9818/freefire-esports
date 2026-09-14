package com.freefireesports.app.screens

import androidx.compose.foundation.layout.Column
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
import androidx.compose.material3.OutlinedButton
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
import com.freefireesports.app.profile.ProfileUiState
import com.freefireesports.app.profile.ProfileViewModel
import com.freefireesports.app.tournament.RegistrationFlowState
import com.freefireesports.app.tournament.TournamentDetailViewModel

@Composable
fun TeamSetupScreen(
    tournamentId: String,
    onRegistered: () -> Unit,
    onBack: () -> Unit,
    viewModel: TournamentDetailViewModel = viewModel(),
    profileViewModel: ProfileViewModel = viewModel(),
) {
    val flowState by viewModel.flowState.collectAsState()
    val profileState by profileViewModel.uiState.collectAsState()

    LaunchedEffect(Unit) { profileViewModel.loadProfile() }
    LaunchedEffect(flowState) {
        if (flowState is RegistrationFlowState.Registered) onRegistered()
    }

    val currentUserId = when (val p = profileState) {
        is ProfileUiState.Loaded -> p.profile.userId
        is ProfileUiState.Saving -> p.profile.userId
        else -> null
    }

    var teamName by remember { mutableStateOf("") }
    var joinTeamId by remember { mutableStateOf("") }
    var myFfUid by remember { mutableStateOf("") }
    var myFfIgn by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp).verticalScroll(rememberScrollState()),
    ) {
        TextButton(onClick = onBack) { Text("← Back") }
        Spacer(modifier = Modifier.height(8.dp))

        if (currentUserId == null) {
            CircularProgressIndicator()
        } else {
            when (val state = flowState) {
                is RegistrationFlowState.TeamReady -> {
                    val team = state.team
                    Text("Team: ${team.name}", style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "Team ID (share with teammates so they can join): ${team.id}",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    Text("Roster (${team.members.size} joined)", style = MaterialTheme.typography.titleMedium)
                    team.members.forEach { m ->
                        val label = if (m.ffIgn.isNotBlank()) m.ffIgn else "(details pending)"
                        Text("• $label${if (m.isCaptain) "  (Captain)" else ""}")
                    }

                    val myMembership = team.members.find { it.userId == currentUserId }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Your Free Fire info", style = MaterialTheme.typography.titleMedium)
                    OutlinedTextField(
                        value = myFfUid,
                        onValueChange = { myFfUid = it },
                        label = { Text("Your Free Fire UID") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = myFfIgn,
                        onValueChange = { myFfIgn = it },
                        label = { Text("Your Free Fire IGN") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {
                            viewModel.submitMyTeamInfo(team.id, myFfUid, myFfIgn, myMembership != null)
                        },
                        enabled = myFfUid.isNotBlank() && myFfIgn.isNotBlank(),
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Save my info")
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(onClick = { viewModel.refreshTeam(team.id) }, modifier = Modifier.fillMaxWidth()) {
                        Text("Refresh roster")
                    }

                    if (team.captainId == currentUserId) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { viewModel.finalizeTeam(tournamentId, team.id) },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Finalize Registration")
                        }
                    }
                }

                else -> {
                    Text("Create a new team", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = teamName,
                        onValueChange = { teamName = it },
                        label = { Text("Team name") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = { viewModel.createTeam(tournamentId, teamName) },
                        enabled = teamName.isNotBlank() && flowState !is RegistrationFlowState.InProgress,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Create Team")
                    }

                    Spacer(modifier = Modifier.height(32.dp))
                    Text("— or —", style = MaterialTheme.typography.bodySmall)
                    Spacer(modifier = Modifier.height(16.dp))

                    Text("Join an existing team", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = joinTeamId,
                        onValueChange = { joinTeamId = it },
                        label = { Text("Team ID from your captain") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = { viewModel.previewTeam(joinTeamId) },
                        enabled = joinTeamId.isNotBlank() && flowState !is RegistrationFlowState.InProgress,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Find Team")
                    }
                }
            }

            if (flowState is RegistrationFlowState.Error) {
                Spacer(modifier = Modifier.height(16.dp))
                Text((flowState as RegistrationFlowState.Error).message, color = MaterialTheme.colorScheme.error)
            }
        }
    }
}
