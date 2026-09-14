package com.freefireesports.app.wallet

import com.freefireesports.app.network.ApiClient

class WalletRepository {
    private val api = ApiClient.walletApi

    suspend fun getWallet() = api.getWallet()

    suspend fun getTransactions() = api.getTransactions()
}
