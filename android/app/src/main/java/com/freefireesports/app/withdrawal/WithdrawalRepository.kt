package com.freefireesports.app.withdrawal

import com.freefireesports.app.network.ApiClient
import com.freefireesports.app.network.RequestWithdrawalBody

class WithdrawalRepository {
    private val api = ApiClient.withdrawalApi

    suspend fun requestWithdrawal(amount: Int, upiId: String) =
        api.requestWithdrawal(RequestWithdrawalBody(amount, upiId))

    suspend fun myRequests() = api.myRequests()
}
