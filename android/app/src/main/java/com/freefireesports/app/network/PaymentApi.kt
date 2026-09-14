package com.freefireesports.app.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface PaymentApi {
    @GET("settings/payment-info")
    suspend fun getPaymentInfo(): PaymentInfoDto

    @POST("wallet/payment-requests")
    suspend fun createRequest(@Body body: CreatePaymentRequestBody): PaymentRequestDto

    @GET("wallet/payment-requests/mine")
    suspend fun myRequests(): List<PaymentRequestDto>

    @PUT("wallet/payment-requests/{id}/reference")
    suspend fun submitReference(@Path("id") id: String, @Body body: SubmitReferenceBody): PaymentRequestDto
}

data class PaymentInfoDto(
    val upiId: String,
    val upiPayeeName: String,
    val coinRateInr: Int,
)

data class PaymentRequestDto(
    val id: String,
    val requestedCoins: Int,
    val expectedAmount: Int,
    val upiDestination: String,
    val utrReference: String?,
    val status: String,
    val createdAt: String,
)

data class CreatePaymentRequestBody(val requestedCoins: Int)

data class SubmitReferenceBody(val utrReference: String?, val screenshotUrl: String? = null)
