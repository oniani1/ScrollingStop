package com.scrollingstop.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.ui.dashboard.DashboardScreen
import com.scrollingstop.ui.onboarding.OnboardingScreen
import com.scrollingstop.ui.settings.SettingsScreen
import com.scrollingstop.ui.stats.StatsScreen
import com.scrollingstop.ui.theme.AccentBlue
import com.scrollingstop.ui.theme.DeepBlack
import com.scrollingstop.ui.theme.Gray600
import com.scrollingstop.ui.theme.SurfaceCard

object Routes {
    const val ONBOARDING = "onboarding"
    const val DASHBOARD = "dashboard"
    const val SETTINGS = "settings"
    const val STATS = "stats"
}

private data class BottomNavItem(
    val route: String,
    val label: String,
    val icon: ImageVector
)

private val bottomNavItems = listOf(
    BottomNavItem(Routes.DASHBOARD, "Dashboard", Icons.Default.Home),
    BottomNavItem(Routes.STATS, "Stats", Icons.Default.BarChart),
    BottomNavItem(Routes.SETTINGS, "Settings", Icons.Default.Settings),
)

@Composable
fun AppNavigation(prefs: SecurePreferences) {
    val navController = rememberNavController()
    val startDest = if (prefs.onboardingCompleted) Routes.DASHBOARD else Routes.ONBOARDING
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in listOf(Routes.DASHBOARD, Routes.STATS, Routes.SETTINGS)

    Scaffold(
        containerColor = DeepBlack,
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = SurfaceCard,
                    contentColor = Gray600
                ) {
                    bottomNavItems.forEach { item ->
                        val selected = navBackStackEntry?.destination?.hierarchy?.any {
                            it.route == item.route
                        } == true
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                Icon(item.icon, contentDescription = item.label)
                            },
                            label = { Text(item.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = AccentBlue,
                                selectedTextColor = AccentBlue,
                                unselectedIconColor = Gray600,
                                unselectedTextColor = Gray600,
                                indicatorColor = AccentBlue.copy(alpha = 0.12f)
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDest,
            modifier = Modifier.padding(innerPadding)
        ) {
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
                        navController.navigate(Routes.SETTINGS) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onNavigateToStats = {
                        navController.navigate(Routes.STATS) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
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
}
