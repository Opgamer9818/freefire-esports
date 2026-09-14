package com.freefireesports.app.support

import com.freefireesports.app.network.ApiClient
import com.freefireesports.app.network.CreateTicketBody

class SupportRepository {
    private val api = ApiClient.supportApi

    suspend fun createTicket(category: String, message: String) = api.createTicket(CreateTicketBody(category, message))

    suspend fun myTickets() = api.myTickets()
}
