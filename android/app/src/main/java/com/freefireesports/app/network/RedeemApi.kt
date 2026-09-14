package com.freefireesports.app.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface RedeemApi {
    @POST("wallet/redeem-requests")
    suspend fun submitCode(@Body body: SubmitCodeBody): RedeemRequestDto

    @GET("wallet/redeem-requests/mine")
    suspend fun myRequests(): List<RedeemRequestDto>
}

data class RedeemRequestDto(
    val id: String,
    val status: String,
    val approvedCoins: Int?,
    val adminNote: String?,
    val createdAt: String,
)

data class SubmitCodeBody(val code: String)
