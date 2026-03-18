package com.scrollingstop.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.ui.dashboard.DashboardScreen
import com.scrollingstop.ui.onboarding.OnboardingScreen
import com.scrollingstop.ui.settings.SettingsScreen
import com.scrollingstop.ui.stats.StatsScreen

object Routes {
    const val ONBOARDING = "onboarding"
    const val DASHBOARD = "dashboard"
    const val SETTINGS = "settings"
    const val STATS = "stats"
}

@Composable
fun AppNavigation(prefs: SecurePreferences) {
    val navController = rememberNavController()
    val startDest = if (prefs.onboardingCompleted) Routes.DASHBOARD else Routes.ONBOARDING

    NavHost(navController = navController, startDestination = startDest) {
        composable(Routes.ONBOARDING) {
            OnboardingScreen(
                prefs = prefs,
                onComplete = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.ONBOARDING) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.DASHBOARD) {
            DashboardScreen(
                onNavigateToSettings = {
                    navController.navigate(Routes.SETTINGS)
                },
                onNavigateToStats = {
                    navController.navigate(Routes.STATS)
                }
            )
        }

        composable(Routes.SETTINGS) {
            SettingsScreen(
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.STATS) {
            StatsScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
