package com.freefireesports.app.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface WithdrawalApi {
    @POST("withdrawals")
    suspend fun requestWithdrawal(@Body body: RequestWithdrawalBody): WithdrawalRequestDto

    @GET("withdrawals/mine")
    suspend fun myRequests(): List<WithdrawalRequestDto>
}

data class WithdrawalRequestDto(
    val id: String,
    val amount: Int,
    val upiId: String,
    val status: String,
    val adminNote: String?,
    val createdAt: String,
)

data class RequestWithdrawalBody(val amount: Int, val upiId: String)
