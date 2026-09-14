package com.freefireesports.app.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.freefireesports.app.notification.NotificationRepository
import com.freefireesports.app.notification.NotificationViewModel
import com.freefireesports.app.tournament.TournamentListUiState
import com.freefireesports.app.tournament.TournamentListViewModel
import com.freefireesports.app.wallet.WalletUiState
import com.freefireesports.app.wallet.WalletViewModel
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await

@Composable
fun HomeScreen(
    onOpenTournament: (String) -> Unit,
    onOpenWallet: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenSupport: () -> Unit,
    onSignOut: () -> Unit,
    tournamentViewModel: TournamentListViewModel = viewModel(),
    walletViewModel: WalletViewModel = viewModel(),
    notificationViewModel: NotificationViewModel = viewModel(),
) {
    val uiState by tournamentViewModel.uiState.collectAsState()
    val walletState by walletViewModel.uiState.collectAsState()
    val unreadCount by notificationViewModel.unreadCount.collectAsState()

    LaunchedEffect(Unit) {
        tournamentViewModel.load()
        walletViewModel.load()
        notificationViewModel.load()
        // Covers the case where the FCM token was generated before this
        // user ever logged in — onNewToken() in FcmService only fires on
        // a genuine refresh, not on every app start.
        try {
            val token = FirebaseMessaging.getInstance().token.await()
            NotificationRepository().registerFcmToken(token)
        } catch (_: Exception) {
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("Free Fire Esports", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box {
                    TextButton(onClick = onOpenNotifications) { Text("Alerts") }
                    if (unreadCount > 0) {
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .background(Color.Red, CircleShape),
                        ) {
                            Text(
                                unreadCount.coerceAtMost(9).toString(),
                                color = Color.White,
                                fontSize = 10.sp,
                                modifier = Modifier.padding(2.dp),
                            )
                        }
                    }
                }
                TextButton(onClick = onOpenSupport) { Text("Support") }
                TextButton(onClick = onSignOut) { Text("Sign out") }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Card(onClick = onOpenWallet, modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Wallet balance")
                val balance = (walletState as? WalletUiState.Loaded)?.wallet?.availableBalance
                Text(if (balance != null) "$balance coins" else "…", fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))
        Text("Tournaments", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))

        when (val state = uiState) {
            is TournamentListUiState.Loading -> CircularProgressIndicator()
            is TournamentListUiState.Error -> Text(state.message, color = MaterialTheme.colorScheme.error)
            is TournamentListUiState.Loaded -> {
                if (state.tournaments.isEmpty()) {
                    Text("No upcoming tournaments right now.")
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(state.tournaments) { t ->
                            Card(onClick = { onOpenTournament(t.id) }, modifier = Modifier.fillMaxWidth()) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(t.name, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        "${t.format} · ${if (t.isFree) "Free" else "${t.entryFeeCoins} coins"} · " +
                                            "${t.slotsFilled}/${t.slots} slots",
                                        style = MaterialTheme.typography.bodySmall,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
