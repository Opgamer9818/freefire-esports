package com.freefireesports.app.wallet

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freefireesports.app.network.WalletDto
import com.freefireesports.app.network.WalletTransactionDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class WalletUiState {
    data object Loading : WalletUiState()
    data class Loaded(val wallet: WalletDto, val transactions: List<WalletTransactionDto>) : WalletUiState()
    data class Error(val message: String) : WalletUiState()
}

class WalletViewModel(private val repository: WalletRepository = WalletRepository()) : ViewModel() {

    private val _uiState = MutableStateFlow<WalletUiState>(WalletUiState.Loading)
    val uiState: StateFlow<WalletUiState> = _uiState.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _uiState.value = WalletUiState.Loading
            try {
                val wallet = repository.getWallet()
                val transactions = repository.getTransactions()
                _uiState.value = WalletUiState.Loaded(wallet, transactions)
            } catch (e: Exception) {
                _uiState.value = WalletUiState.Error(e.message ?: "Could not load wallet")
            }
        }
    }
}
