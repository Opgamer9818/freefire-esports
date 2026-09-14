package com.freefireesports.app.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface TournamentApi {
    @GET("tournaments")
    suspend fun listTournaments(
        @Query("status") status: String? = null,
        @Query("isFree") isFree: Boolean? = null,
    ): List<TournamentDto>

    @GET("tournaments/mine")
    suspend fun myRegistrations(): List<RegistrationDto>

    @GET("tournaments/{id}")
    suspend fun getTournament(@Path("id") id: String): TournamentDto

    @POST("tournaments/{id}/register")
    suspend fun registerSolo(@Path("id") id: String): RegistrationDto

    @POST("tournaments/{id}/teams")
    suspend fun createTeam(@Path("id") id: String, @Body body: CreateTeamRequest): TeamDto

    @GET("tournaments/teams/{teamId}")
    suspend fun getTeam(@Path("teamId") teamId: String): TeamDto

    @POST("tournaments/teams/{teamId}/join")
    suspend fun joinTeam(@Path("teamId") teamId: String, @Body body: JoinTeamRequest): TeamMemberDto

    @PUT("tournaments/teams/{teamId}/me")
    suspend fun updateMyTeamInfo(@Path("teamId") teamId: String, @Body body: JoinTeamRequest): TeamMemberDto

    @POST("tournaments/{id}/teams/{teamId}/finalize")
    suspend fun finalizeTeamRegistration(@Path("id") id: String, @Path("teamId") teamId: String): RegistrationDto
}

data class TournamentDto(
    val id: String,
    val name: String,
    val game: String,
    val bannerUrl: String?,
    val description: String?,
    val format: String,
    val teamSize: Int,
    val entryFeeCoins: Int,
    val isFree: Boolean,
    val prizePool: Int,
    val slots: Int,
    val slotsFilled: Int,
    val date: String,
    val startTime: String,
    val registrationOpenAt: String,
    val registrationCloseAt: String,
    val rules: String?,
    val roomId: String?,
    val roomPassword: String?,
    val status: String,
    val featured: Boolean,
)

data class TeamMemberDto(
    val id: String,
    val teamId: String,
    val userId: String?,
    val ffUid: String,
    val ffIgn: String,
    val contact: String?,
    val isCaptain: Boolean,
)

data class TeamDto(
    val id: String,
    val tournamentId: String,
    val name: String,
    val captainId: String,
    val members: List<TeamMemberDto>,
)

data class RegistrationDto(
    val id: String,
    val tournamentId: String,
    val userId: String,
    val teamId: String?,
    val status: String,
    val entryFeePaid: Int,
    val registeredAt: String,
)

data class CreateTeamRequest(val name: String)

data class JoinTeamRequest(val ffUid: String, val ffIgn: String, val contact: String? = null)
