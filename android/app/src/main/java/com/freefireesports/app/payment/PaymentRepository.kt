package com.freefireesports.app.payment

import com.freefireesports.app.network.ApiClient
import com.freefireesports.app.network.CreatePaymentRequestBody
import com.freefireesports.app.network.SubmitReferenceBody

class PaymentRepository {
    private val api = ApiClient.paymentApi

    suspend fun getPaymentInfo() = api.getPaymentInfo()

    suspend fun createRequest(coins: Int) = api.createRequest(CreatePaymentRequestBody(coins))

    suspend fun myRequests() = api.myRequests()

    suspend fun submitReference(requestId: String, utr: String?) =
        api.submitReference(requestId, SubmitReferenceBody(utr))
}
