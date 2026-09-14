package com.freefireesports.app.redeem

import com.freefireesports.app.network.ApiClient
import com.freefireesports.app.network.SubmitCodeBody

class RedeemRepository {
    private val api = ApiClient.redeemApi

    suspend fun submitCode(code: String) = api.submitCode(SubmitCodeBody(code))

    suspend fun myRequests() = api.myRequests()
}
