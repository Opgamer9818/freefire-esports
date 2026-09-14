package com.freefireesports.app.tournament

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freefireesports.app.network.TeamDto
import com.freefireesports.app.network.TournamentDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class RegistrationFlowState {
    data object Idle : RegistrationFlowState()
    data object InProgress : RegistrationFlowState()
    data class TeamReady(val team: TeamDto) : RegistrationFlowState()
    data object Registered : RegistrationFlowState()
    data class Error(val message: String) : RegistrationFlowState()
}

class TournamentDetailViewModel(
    private val repository: TournamentRepository = TournamentRepository(),
) : ViewModel() {

    private val _tournament = MutableStateFlow<TournamentDto?>(null)
    val tournament: StateFlow<TournamentDto?> = _tournament.asStateFlow()

    private val _flowState = MutableStateFlow<RegistrationFlowState>(RegistrationFlowState.Idle)
    val flowState: StateFlow<RegistrationFlowState> = _flowState.asStateFlow()

    fun load(tournamentId: String) {
        viewModelScope.launch {
            try {
                _tournament.value = repository.getTournament(tournamentId)
            } catch (e: Exception) {
                _flowState.value = RegistrationFlowState.Error(e.message ?: "Could not load tournament")
            }
        }
    }

    fun registerSolo(tournamentId: String) {
        _flowState.value = RegistrationFlowState.InProgress
        viewModelScope.launch {
            try {
                repository.registerSolo(tournamentId)
                _flowState.value = RegistrationFlowState.Registered
            } catch (e: Exception) {
                _flowState.value = RegistrationFlowState.Error(e.message ?: "Registration failed")
            }
        }
    }

    fun createTeam(tournamentId: String, name: String) {
        _flowState.value = RegistrationFlowState.InProgress
        viewModelScope.launch {
            try {
                _flowState.value = RegistrationFlowState.TeamReady(repository.createTeam(tournamentId, name))
            } catch (e: Exception) {
                _flowState.value = RegistrationFlowState.Error(e.message ?: "Could not create team")
            }
        }
    }

    // Just previews the team so the user can confirm it before actually
    // joining — joining happens when they submit their own UID/IGN.
    fun previewTeam(teamId: String) {
        _flowState.value = RegistrationFlowState.InProgress
        viewModelScope.launch {
            try {
                _flowState.value = RegistrationFlowState.TeamReady(repository.getTeam(teamId))
            } catch (e: Exception) {
                _flowState.value = RegistrationFlowState.Error(e.message ?: "Team not found")
            }
        }
    }

    fun refreshTeam(teamId: String) {
        viewModelScope.launch {
            try {
                _flowState.value = RegistrationFlowState.TeamReady(repository.getTeam(teamId))
            } catch (e: Exception) {
                _flowState.value = RegistrationFlowState.Error(e.message ?: "Could not refresh team")
            }
        }
    }

    fun submitMyTeamInfo(teamId: String, ffUid: String, ffIgn: String, alreadyMember: Boolean) {
        viewModelScope.launch {
            try {
                if (alreadyMember) {
                    repository.updateMyTeamInfo(teamId, ffUid, ffIgn, null)
                } else {
                    repository.joinTeam(teamId, ffUid, ffIgn, null)
                }
                _flowState.value = RegistrationFlowState.TeamReady(repository.getTeam(teamId))
            } catch (e: Exception) {
                _flowState.value = RegistrationFlowState.Error(e.message ?: "Could not save your info")
            }
        }
    }

    fun finalizeTeam(tournamentId: String, teamId: String) {
        _flowState.value = RegistrationFlowState.InProgress
        viewModelScope.launch {
            try {
                repository.finalizeTeamRegistration(tournamentId, teamId)
                _flowState.value = RegistrationFlowState.Registered
            } catch (e: Exception) {
                _flowState.value = RegistrationFlowState.Error(e.message ?: "Could not finalize registration")
            }
        }
    }
}
