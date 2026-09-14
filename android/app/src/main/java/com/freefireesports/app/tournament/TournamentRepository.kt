package com.freefireesports.app.tournament

import com.freefireesports.app.network.ApiClient
import com.freefireesports.app.network.CreateTeamRequest
import com.freefireesports.app.network.JoinTeamRequest

class TournamentRepository {
    private val api = ApiClient.tournamentApi

    suspend fun listTournaments(status: String? = null, isFree: Boolean? = null) =
        api.listTournaments(status, isFree)

    suspend fun myRegistrations() = api.myRegistrations()

    suspend fun getTournament(id: String) = api.getTournament(id)

    suspend fun registerSolo(id: String) = api.registerSolo(id)

    suspend fun createTeam(id: String, name: String) = api.createTeam(id, CreateTeamRequest(name))

    suspend fun getTeam(teamId: String) = api.getTeam(teamId)

    suspend fun joinTeam(teamId: String, ffUid: String, ffIgn: String, contact: String?) =
        api.joinTeam(teamId, JoinTeamRequest(ffUid, ffIgn, contact))

    suspend fun updateMyTeamInfo(teamId: String, ffUid: String, ffIgn: String, contact: String?) =
        api.updateMyTeamInfo(teamId, JoinTeamRequest(ffUid, ffIgn, contact))

    suspend fun finalizeTeamRegistration(tournamentId: String, teamId: String) =
        api.finalizeTeamRegistration(tournamentId, teamId)
}
