package com.freefireesports.app.tournament

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freefireesports.app.network.TournamentDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class TournamentListUiState {
    data object Loading : TournamentListUiState()
    data class Loaded(val tournaments: List<TournamentDto>) : TournamentListUiState()
    data class Error(val message: String) : TournamentListUiState()
}

class TournamentListViewModel(
    private val repository: TournamentRepository = TournamentRepository(),
) : ViewModel() {

    private val _uiState = MutableStateFlow<TournamentListUiState>(TournamentListUiState.Loading)
    val uiState: StateFlow<TournamentListUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = TournamentListUiState.Loading
            try {
                _uiState.value = TournamentListUiState.Loaded(repository.listTournaments())
            } catch (e: Exception) {
                _uiState.value = TournamentListUiState.Error(e.message ?: "Could not load tournaments")
            }
        }
    }
}
