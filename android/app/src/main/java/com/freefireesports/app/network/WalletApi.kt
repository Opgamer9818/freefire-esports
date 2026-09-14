package com.freefireesports.app.network

import retrofit2.http.GET

interface WalletApi {
    @GET("wallet")
    suspend fun getWallet(): WalletDto

    @GET("wallet/transactions")
    suspend fun getTransactions(): List<WalletTransactionDto>
}

data class WalletDto(
    val id: String,
    val userId: String,
    val availableBalance: Int,
    val reservedBalance: Int,
)

data class WalletTransactionDto(
    val id: String,
    val type: String,
    val amount: Int,
    val balanceAfter: Int,
    val status: String,
    val reference: String?,
    val description: String?,
    val createdAt: String,
)
