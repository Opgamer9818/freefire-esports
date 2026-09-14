package com.freefireesports.app.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.freefireesports.app.wallet.WalletUiState
import com.freefireesports.app.wallet.WalletViewModel

@Composable
fun WalletScreen(
    onBack: () -> Unit,
    onAddCoins: () -> Unit,
    onRedeemCode: () -> Unit,
    onWithdraw: () -> Unit,
    viewModel: WalletViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    LaunchedEffect(Unit) { viewModel.load() }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        TextButton(onClick = onBack) { Text("← Back") }
        Text("Wallet", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(16.dp))

        when (val state = uiState) {
            is WalletUiState.Loading -> CircularProgressIndicator()
            is WalletUiState.Error -> Text(state.message, color = MaterialTheme.colorScheme.error)
            is WalletUiState.Loaded -> {
                Text(
                    "${state.wallet.availableBalance} coins",
                    style = MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onAddCoins) { Text("Add Coins") }
                    OutlinedButton(onClick = onRedeemCode) { Text("Redeem Code") }
                    OutlinedButton(onClick = onWithdraw) { Text("Withdraw") }
                }
                Spacer(modifier = Modifier.height(24.dp))
                Text("Recent transactions", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(8.dp))

                if (state.transactions.isEmpty()) {
                    Text("No wallet transactions yet.")
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        items(state.transactions) { txn ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                            ) {
                                Column {
                                    Text(txn.type.replace('_', ' '))
                                    txn.description?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                                }
                                Text(
                                    text = if (txn.amount >= 0) "+${txn.amount}" else "${txn.amount}",
                                    color = if (txn.amount >= 0) Color(0xFF4CAF50) else MaterialTheme.colorScheme.error,
                                    fontWeight = FontWeight.Bold,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
