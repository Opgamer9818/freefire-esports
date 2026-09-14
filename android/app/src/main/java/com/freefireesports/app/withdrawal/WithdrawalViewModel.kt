package com.freefireesports.app.withdrawal

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freefireesports.app.network.WithdrawalRequestDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class WithdrawalUiState {
    data object Idle : WithdrawalUiState()
    data object Submitting : WithdrawalUiState()
    data object Submitted : WithdrawalUiState()
    data class Error(val message: String) : WithdrawalUiState()
}

class WithdrawalViewModel(
    private val repository: WithdrawalRepository = WithdrawalRepository(),
) : ViewModel() {

    private val _uiState = MutableStateFlow<WithdrawalUiState>(WithdrawalUiState.Idle)
    val uiState: StateFlow<WithdrawalUiState> = _uiState.asStateFlow()

    private val _myRequests = MutableStateFlow<List<WithdrawalRequestDto>>(emptyList())
    val myRequests: StateFlow<List<WithdrawalRequestDto>> = _myRequests.asStateFlow()

    fun loadMyRequests() {
        viewModelScope.launch {
            try {
                _myRequests.value = repository.myRequests()
            } catch (_: Exception) {
            }
        }
    }

    fun submit(amount: Int, upiId: String) {
        _uiState.value = WithdrawalUiState.Submitting
        viewModelScope.launch {
            try {
                repository.requestWithdrawal(amount, upiId)
                _uiState.value = WithdrawalUiState.Submitted
                loadMyRequests()
            } catch (e: Exception) {
                _uiState.value = WithdrawalUiState.Error(e.message ?: "Could not submit withdrawal")
            }
        }
    }

    fun reset() {
        _uiState.value = WithdrawalUiState.Idle
    }
}
