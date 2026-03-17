package com.scrollingstop.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.scrollingstop.ui.theme.Gray100
import com.scrollingstop.ui.theme.Gray300
import com.scrollingstop.ui.theme.Gray400
import com.scrollingstop.ui.theme.Gray600
import com.scrollingstop.ui.theme.Gray800
import com.scrollingstop.ui.theme.Gray900
import com.scrollingstop.ui.theme.Gray950

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToSettings: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val liveUsage by viewModel.todayUsage.collectAsState()

    val usedSeconds = maxOf(state.usedSeconds, liveUsage)
    val limitSeconds = state.limitSeconds
    val progress = if (limitSeconds > 0) usedSeconds.toFloat() / limitSeconds else 0f

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("ScrollingStop", color = Gray100) },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Gray400)
                    }
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Gray400)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Gray950)
            )
        },
        containerColor = Gray950
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(16.dp))

            // Circular progress
            Box(contentAlignment = Alignment.Center) {
                CircularProgressIndicator(
                    progress = { progress.coerceIn(0f, 1f) },
                    modifier = Modifier.size(160.dp),
                    strokeWidth = 10.dp,
                    color = if (progress >= 1f) Gray600 else Gray300,
                    trackColor = Gray800
                )
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        formatDuration(usedSeconds),
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = Gray100
                    )
                    Text(
                        "of ${formatDuration(limitSeconds)}",
                        fontSize = 14.sp,
                        color = Gray600
                    )
                }
            }

            Spacer(Modifier.height(20.dp))

            // Status badge
            val (statusText, statusIcon) = if (state.isUnlocked) {
                "Unlocked" to Icons.Default.LockOpen
            } else {
                "Locked" to Icons.Default.Lock
            }
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Gray900)
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(statusIcon, null, tint = Gray300, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text(statusText, color = Gray300, fontSize = 14.sp, fontWeight = FontWeight.Medium)
            }

            Spacer(Modifier.height(24.dp))

            // Today's trade details
            if (state.todayUnlock != null) {
                InfoCard("Today's Trade") {
                    val unlock = state.todayUnlock!!
                    StatRow("Source", unlock.source.replaceFirstChar { it.uppercase() })
                    StatRow("Profit", "$${String.format("%.2f", unlock.profitUsd)}")
                }
                Spacer(Modifier.height(12.dp))
            }

            // Weekly stats
            InfoCard("This Week") {
                StatRow("Trade Unlocks", "${state.weeklyTradeUnlocks}")
                StatRow("Bypasses", "${state.weeklyBypasses}")
            }

            Spacer(Modifier.height(12.dp))

            // Streak
            if (state.streakDays > 0) {
                InfoCard("Streak") {
                    Text(
                        "${state.streakDays}-day trade streak",
                        color = Gray100,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(Modifier.height(12.dp))
            }

            // Trade check button
            Button(
                onClick = { viewModel.checkTrade() },
                enabled = !state.isCheckingTrade,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Gray800,
                    contentColor = Gray100
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                if (state.isCheckingTrade) {
                    CircularProgressIndicator(Modifier.size(18.dp), color = Gray400, strokeWidth = 2.dp)
                    Spacer(Modifier.width(8.dp))
                    Text("Checking...")
                } else {
                    Icon(Icons.Default.Refresh, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Check for trades")
                }
            }

            state.tradeCheckMessage?.let {
                Spacer(Modifier.height(8.dp))
                Text(it, color = Gray400, fontSize = 13.sp)
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun InfoCard(title: String, content: @Composable () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Gray900, RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Text(title, color = Gray400, fontSize = 12.sp, fontWeight = FontWeight.Medium)
        Spacer(Modifier.height(8.dp))
        content()
    }
}

@Composable
private fun StatRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Gray400, fontSize = 15.sp)
        Text(value, color = Gray100, fontSize = 15.sp, fontWeight = FontWeight.Medium)
    }
}

private fun formatDuration(totalSeconds: Int): String {
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    return when {
        hours > 0 -> "${hours}h ${minutes}m"
        else -> "${minutes}m"
    }
}
