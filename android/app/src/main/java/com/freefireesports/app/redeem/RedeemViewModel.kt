package com.freefireesports.app.redeem

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freefireesports.app.network.RedeemRequestDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class RedeemUiState {
    data object Idle : RedeemUiState()
    data object Submitting : RedeemUiState()
    data object Submitted : RedeemUiState()
    data class Error(val message: String) : RedeemUiState()
}

class RedeemViewModel(
    private val repository: RedeemRepository = RedeemRepository(),
) : ViewModel() {

    private val _uiState = MutableStateFlow<RedeemUiState>(RedeemUiState.Idle)
    val uiState: StateFlow<RedeemUiState> = _uiState.asStateFlow()

    private val _myRequests = MutableStateFlow<List<RedeemRequestDto>>(emptyList())
    val myRequests: StateFlow<List<RedeemRequestDto>> = _myRequests.asStateFlow()

    fun loadMyRequests() {
        viewModelScope.launch {
            try {
                _myRequests.value = repository.myRequests()
            } catch (_: Exception) {
            }
        }
    }

    fun submitCode(code: String) {
        _uiState.value = RedeemUiState.Submitting
        viewModelScope.launch {
            try {
                repository.submitCode(code)
                _uiState.value = RedeemUiState.Submitted
                loadMyRequests()
            } catch (e: Exception) {
                _uiState.value = RedeemUiState.Error(e.message ?: "Could not submit code")
            }
        }
    }

    fun reset() {
        _uiState.value = RedeemUiState.Idle
    }
}
