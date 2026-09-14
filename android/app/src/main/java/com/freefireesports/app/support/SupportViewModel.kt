package com.freefireesports.app.support

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freefireesports.app.network.SupportTicketDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class SupportUiState {
    data object Idle : SupportUiState()
    data object Submitting : SupportUiState()
    data object Submitted : SupportUiState()
    data class Error(val message: String) : SupportUiState()
}

class SupportViewModel(
    private val repository: SupportRepository = SupportRepository(),
) : ViewModel() {

    private val _uiState = MutableStateFlow<SupportUiState>(SupportUiState.Idle)
    val uiState: StateFlow<SupportUiState> = _uiState.asStateFlow()

    private val _myTickets = MutableStateFlow<List<SupportTicketDto>>(emptyList())
    val myTickets: StateFlow<List<SupportTicketDto>> = _myTickets.asStateFlow()

    fun loadMyTickets() {
        viewModelScope.launch {
            try {
                _myTickets.value = repository.myTickets()
            } catch (_: Exception) {
            }
        }
    }

    fun submit(category: String, message: String) {
        _uiState.value = SupportUiState.Submitting
        viewModelScope.launch {
            try {
                repository.createTicket(category, message)
                _uiState.value = SupportUiState.Submitted
                loadMyTickets()
            } catch (e: Exception) {
                _uiState.value = SupportUiState.Error(e.message ?: "Could not submit ticket")
            }
        }
    }

    fun reset() {
        _uiState.value = SupportUiState.Idle
    }
}
