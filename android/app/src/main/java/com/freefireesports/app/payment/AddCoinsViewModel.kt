package com.freefireesports.app.payment

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freefireesports.app.network.PaymentInfoDto
import com.freefireesports.app.network.PaymentRequestDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AddCoinsUiState {
    data object Idle : AddCoinsUiState()
    data object Submitting : AddCoinsUiState()
    data class Submitted(val request: PaymentRequestDto) : AddCoinsUiState()
    data class Error(val message: String) : AddCoinsUiState()
}

class AddCoinsViewModel(
    private val repository: PaymentRepository = PaymentRepository(),
) : ViewModel() {

    private val _uiState = MutableStateFlow<AddCoinsUiState>(AddCoinsUiState.Idle)
    val uiState: StateFlow<AddCoinsUiState> = _uiState.asStateFlow()

    private val _paymentInfo = MutableStateFlow<PaymentInfoDto?>(null)
    val paymentInfo: StateFlow<PaymentInfoDto?> = _paymentInfo.asStateFlow()

    private val _myRequests = MutableStateFlow<List<PaymentRequestDto>>(emptyList())
    val myRequests: StateFlow<List<PaymentRequestDto>> = _myRequests.asStateFlow()

    fun loadPaymentInfo() {
        viewModelScope.launch {
            try {
                _paymentInfo.value = repository.getPaymentInfo()
            } catch (_: Exception) {
                // Non-fatal for screen load — the amount confirmation just
                // won't show until this succeeds; user can retry by leaving
                // and re-entering the screen.
            }
        }
    }

    fun loadMyRequests() {
        viewModelScope.launch {
            try {
                _myRequests.value = repository.myRequests()
            } catch (_: Exception) {
            }
        }
    }

    fun submitRequest(coins: Int) {
        _uiState.value = AddCoinsUiState.Submitting
        viewModelScope.launch {
            try {
                val request = repository.createRequest(coins)
                _uiState.value = AddCoinsUiState.Submitted(request)
                loadMyRequests()
            } catch (e: Exception) {
                _uiState.value = AddCoinsUiState.Error(e.message ?: "Could not create request")
            }
        }
    }

    fun submitUtr(requestId: String, utr: String) {
        viewModelScope.launch {
            try {
                repository.submitReference(requestId, utr.ifBlank { null })
                loadMyRequests()
            } catch (_: Exception) {
            }
        }
    }

    fun reset() {
        _uiState.value = AddCoinsUiState.Idle
    }
}
