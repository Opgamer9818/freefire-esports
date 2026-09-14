package com.freefireesports.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.freefireesports.app.auth.AuthUiState
import com.freefireesports.app.auth.AuthViewModel
import com.freefireesports.app.screens.HomeScreen
import com.freefireesports.app.screens.LoginScreen
import com.freefireesports.app.screens.PhoneAuthScreen
import com.freefireesports.app.screens.ProfileSetupScreen
import com.freefireesports.app.screens.AddCoinsScreen
import com.freefireesports.app.screens.NotificationsScreen
import com.freefireesports.app.screens.RedeemCodeScreen
import com.freefireesports.app.screens.SupportScreen
import com.freefireesports.app.screens.TeamSetupScreen
import com.freefireesports.app.screens.TournamentDetailScreen
import com.freefireesports.app.screens.WalletScreen
import com.freefireesports.app.screens.WithdrawalScreen

object Routes {
    const val LOGIN = "login"
    const val PHONE_AUTH = "phone_auth"
    const val PROFILE_SETUP = "profile_setup"
    const val HOME = "home"
    const val TOURNAMENT_DETAIL = "tournament/{tournamentId}"
    const val TEAM_SETUP = "tournament/{tournamentId}/team"
    const val WALLET = "wallet"
    const val ADD_COINS = "wallet/add-coins"
    const val REDEEM_CODE = "wallet/redeem-code"
    const val WITHDRAW = "wallet/withdraw"
    const val NOTIFICATIONS = "notifications"
    const val SUPPORT = "support"

    fun tournamentDetail(id: String) = "tournament/$id"
    fun teamSetup(id: String) = "tournament/$id/team"
}

@Composable
fun NavGraph(navController: NavHostController = rememberNavController()) {
    // Hoisted here (not inside a single composable() block) so LoginScreen
    // and PhoneAuthScreen share the same AuthViewModel instance and state.
    val authViewModel: AuthViewModel = viewModel()
    val authState by authViewModel.uiState.collectAsState()

    val startDestination = if (authState is AuthUiState.SignedIn) Routes.PROFILE_SETUP else Routes.LOGIN

    NavHost(navController = navController, startDestination = startDestination) {
        composable(Routes.LOGIN) {
            LoginScreen(
                authViewModel = authViewModel,
                onContinueWithPhone = { navController.navigate(Routes.PHONE_AUTH) },
                onSignedIn = {
                    navController.navigate(Routes.PROFILE_SETUP) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.PHONE_AUTH) {
            PhoneAuthScreen(
                authViewModel = authViewModel,
                onSignedIn = {
                    navController.navigate(Routes.PROFILE_SETUP) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() },
            )
        }
        composable(Routes.PROFILE_SETUP) {
            ProfileSetupScreen(
                onSaved = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.PROFILE_SETUP) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.HOME) {
            HomeScreen(
                onOpenTournament = { id -> navController.navigate(Routes.tournamentDetail(id)) },
                onOpenWallet = { navController.navigate(Routes.WALLET) },
                onOpenNotifications = { navController.navigate(Routes.NOTIFICATIONS) },
                onOpenSupport = { navController.navigate(Routes.SUPPORT) },
                onSignOut = {
                    authViewModel.signOut()
                    navController.navigate(Routes.LOGIN) { popUpTo(0) }
                },
            )
        }
        composable(
            route = Routes.TOURNAMENT_DETAIL,
            arguments = listOf(navArgument("tournamentId") { type = NavType.StringType }),
        ) { backStackEntry ->
            val tournamentId = backStackEntry.arguments?.getString("tournamentId").orEmpty()
            TournamentDetailScreen(
                tournamentId = tournamentId,
                onNeedsTeam = { id -> navController.navigate(Routes.teamSetup(id)) },
                onRegistered = {
                    navController.navigate(Routes.HOME) { popUpTo(Routes.HOME) { inclusive = true } }
                },
                onBack = { navController.popBackStack() },
            )
        }
        composable(
            route = Routes.TEAM_SETUP,
            arguments = listOf(navArgument("tournamentId") { type = NavType.StringType }),
        ) { backStackEntry ->
            val tournamentId = backStackEntry.arguments?.getString("tournamentId").orEmpty()
            TeamSetupScreen(
                tournamentId = tournamentId,
                onRegistered = {
                    navController.navigate(Routes.HOME) { popUpTo(Routes.HOME) { inclusive = true } }
                },
                onBack = { navController.popBackStack() },
            )
        }
        composable(Routes.WALLET) {
            WalletScreen(
                onBack = { navController.popBackStack() },
                onAddCoins = { navController.navigate(Routes.ADD_COINS) },
                onRedeemCode = { navController.navigate(Routes.REDEEM_CODE) },
                onWithdraw = { navController.navigate(Routes.WITHDRAW) },
            )
        }
        composable(Routes.ADD_COINS) {
            AddCoinsScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.REDEEM_CODE) {
            RedeemCodeScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.WITHDRAW) {
            WithdrawalScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.NOTIFICATIONS) {
            NotificationsScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.SUPPORT) {
            SupportScreen(onBack = { navController.popBackStack() })
        }
    }
}
