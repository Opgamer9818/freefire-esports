package com.freefireesports.app.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.freefireesports.app.payment.AddCoinsUiState
import com.freefireesports.app.payment.AddCoinsViewModel
import com.freefireesports.app.util.UpiHelper

@Composable
fun AddCoinsScreen(
    onBack: () -> Unit,
    viewModel: AddCoinsViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val paymentInfo by viewModel.paymentInfo.collectAsState()
    val myRequests by viewModel.myRequests.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.loadPaymentInfo()
        viewModel.loadMyRequests()
    }

    var coinsText by remember { mutableStateOf("") }
    var utrText by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        TextButton(onClick = onBack) { Text("← Back") }
        Text("Add Coins", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(16.dp))

        when (val state = uiState) {
            is AddCoinsUiState.Submitted -> {
                val info = paymentInfo
                val request = state.request

                Text(
                    "Amount to Pay: ₹${request.expectedAmount}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
                Text("For ${request.requestedCoins} coins", style = MaterialTheme.typography.bodyMedium)
                Spacer(modifier = Modifier.height(16.dp))

                if (info != null) {
                    val upiUri = remember(request.id) {
                        UpiHelper.buildUpiUri(
                            upiId = request.upiDestination,
                            payeeName = info.upiPayeeName,
                            amountRupees = request.expectedAmount,
                            note = "FF Esports coins",
                        )
                    }
                    val qrBitmap = remember(request.id) { UpiHelper.generateQrBitmap(upiUri).asImageBitmap() }

                    Image(bitmap = qrBitmap, contentDescription = "UPI QR code", modifier = Modifier.size(220.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Pay to: ${request.upiDestination}", style = MaterialTheme.typography.bodySmall)
                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(upiUri))) },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Pay via UPI app")
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
                Text(
                    "Your payment request has been received. Once you've paid, add your UTR/reference " +
                        "number below and submit — the owner checks each payment manually, so it may " +
                        "take a little time to be approved.",
                    style = MaterialTheme.typography.bodyMedium,
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = utrText,
                    onValueChange = { utrText = it },
                    label = { Text("UTR / reference number") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = {
                        viewModel.submitUtr(request.id, utrText)
                        utrText = ""
                    },
                    enabled = utrText.isNotBlank(),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Submit reference")
                }

                Spacer(modifier = Modifier.height(12.dp))
                OutlinedButton(
                    onClick = {
                        viewModel.reset()
                        coinsText = ""
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Request more coins")
                }
            }

            else -> {
                Text("How many coins do you want?", style = MaterialTheme.typography.titleMedium)
                paymentInfo?.let {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("1 coin = ₹${it.coinRateInr}", style = MaterialTheme.typography.bodySmall)
                }
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = coinsText,
                    onValueChange = { input -> coinsText = input.filter { it.isDigit() } },
                    label = { Text("Coins") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                val coinsInt = coinsText.toIntOrNull() ?: 0
                val info = paymentInfo
                if (coinsInt > 0 && info != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Amount: ₹${coinsInt * info.coinRateInr}", fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { viewModel.submitRequest(coinsInt) },
                    enabled = coinsInt > 0 && uiState !is AddCoinsUiState.Submitting,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Continue to Payment")
                }
                if (uiState is AddCoinsUiState.Submitting) {
                    Spacer(modifier = Modifier.height(12.dp))
                    CircularProgressIndicator()
                }
                if (uiState is AddCoinsUiState.Error) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text((uiState as AddCoinsUiState.Error).message, color = MaterialTheme.colorScheme.error)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Your requests", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        if (myRequests.isEmpty()) {
            Text("No payment requests yet.")
        } else {
            myRequests.forEach { req ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text("${req.requestedCoins} coins (₹${req.expectedAmount})")
                    Text(req.status)
                }
            }
        }
    }
}
