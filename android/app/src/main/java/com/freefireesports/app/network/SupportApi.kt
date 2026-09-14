package com.freefireesports.app.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface SupportApi {
    @POST("support/tickets")
    suspend fun createTicket(@Body body: CreateTicketBody): SupportTicketDto

    @GET("support/tickets/mine")
    suspend fun myTickets(): List<SupportTicketDto>
}

data class SupportTicketDto(
    val id: String,
    val category: String,
    val message: String,
    val status: String,
    val adminResponse: String?,
    val createdAt: String,
)

data class CreateTicketBody(val category: String, val message: String)
