package com.scrollingstop.ui.dashboard

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Share
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
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.scrollingstop.ui.theme.AccentOrange
import com.scrollingstop.ui.theme.AccentOrangeLight
import com.scrollingstop.ui.theme.DeepBlack
import com.scrollingstop.ui.theme.GlassBg
import com.scrollingstop.ui.theme.GlassBorder
import com.scrollingstop.ui.theme.Gray100
import com.scrollingstop.ui.theme.Gray300
import com.scrollingstop.ui.theme.Gray400
import com.scrollingstop.ui.theme.Gray600
import com.scrollingstop.ui.theme.StatusAmber
import com.scrollingstop.ui.theme.StatusGreen
import com.scrollingstop.ui.theme.StatusRed
import com.scrollingstop.ui.theme.SurfaceCard
import com.scrollingstop.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToSettings: () -> Unit,
    onNavigateToStats: () -> Unit = {},
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
                title = {
                    Text(
                        "ScrollStop",
                        color = Gray100,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Gray400)
                    }
                    IconButton(onClick = onNavigateToStats) {
                        Icon(Icons.Default.BarChart, contentDescription = "Stats", tint = Gray400)
                    }
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Gray400)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DeepBlack)
            )
        },
        containerColor = DeepBlack
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .drawBehind {
                    // Subtle ambient glow behind the progress ring
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                if (progress >= 1f) StatusRed.copy(alpha = 0.06f)
                                else AccentOrange.copy(alpha = 0.06f),
                                Color.Transparent
                            ),
                            center = Offset(size.width / 2, size.height * 0.2f),
                            radius = size.width * 0.5f
                        ),
                        radius = size.width * 0.5f,
                        center = Offset(size.width / 2, size.height * 0.2f)
                    )
                }
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(16.dp))

            // Forced profits lifetime tracker
            if (state.totalForcedProfit > 0) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(GlassBg, RoundedCornerShape(16.dp))
                        .border(1.dp, StatusGreen.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        "ScrollStop has earned you",
                        color = Gray400,
                        fontSize = 13.sp
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "$${String.format("%,.0f", state.totalForcedProfit)}",
                        color = StatusGreen,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(Modifier.height(16.dp))
            }

            // Custom gradient progress ring
            Box(contentAlignment = Alignment.Center) {
                GradientProgressRing(
                    progress = progress.coerceIn(0f, 1f),
                    modifier = Modifier.size(200.dp)
                )
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        formatDuration(usedSeconds),
                        fontSize = 36.sp,
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
            val statusColor = if (state.isUnlocked) StatusGreen else AccentOrange
            Row(
                modifier = Modifier
                    .background(GlassBg, CircleShape)
                    .border(1.dp, statusColor.copy(alpha = 0.3f), CircleShape)
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(statusIcon, null, tint = statusColor, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text(statusText, color = statusColor, fontSize = 14.sp, fontWeight = FontWeight.Medium)
            }

            Spacer(Modifier.height(28.dp))

            // Today's trade details
            if (state.todayUnlock != null) {
                GlassInfoCard("Today's Trade") {
                    val unlock = state.todayUnlock!!
                    StatRow("Source", unlock.source.replaceFirstChar { it.uppercase() })
                    StatRow("Profit", "$${String.format("%.2f", unlock.profitUsd)}", valueColor = StatusGreen)
                }
                Spacer(Modifier.height(12.dp))
            }

            // Weekly stats
            GlassInfoCard("This Week") {
                StatRow("Trade Unlocks", "${state.weeklyTradeUnlocks}")
                StatRow("Bypasses", "${state.weeklyBypasses}")
            }

            // Streak
            if (state.streakDays > 0) {
                Spacer(Modifier.height(12.dp))
                GlassInfoCard("Streak") {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "${state.streakDays}",
                                color = AccentOrange,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                "day trade streak",
                                color = Gray300,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        if (state.streakShields > 0) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.Shield,
                                    contentDescription = "Streak shields",
                                    tint = AccentOrange,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(
                                    "x${state.streakShields}",
                                    color = AccentOrange,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(20.dp))

            // Trade check button — solid orange
            Button(
                onClick = { viewModel.checkTrade() },
                enabled = !state.isCheckingTrade,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AccentOrange,
                    contentColor = Color.White,
                    disabledContainerColor = SurfaceCard,
                    disabledContentColor = Gray600
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                if (state.isCheckingTrade) {
                    Row(
                        modifier = Modifier.padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(Modifier.size(18.dp), color = Color.White, strokeWidth = 2.dp)
                        Spacer(Modifier.width(8.dp))
                        Text("Checking...")
                    }
                } else {
                    Row(
                        modifier = Modifier.padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Refresh, null, Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Check for trades", fontWeight = FontWeight.SemiBold)
                    }
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
private fun GradientProgressRing(progress: Float, modifier: Modifier = Modifier) {
    val ringColor = when {
        progress >= 1f -> StatusRed
        progress >= 0.8f -> StatusAmber
        else -> AccentOrange
    }

    Canvas(modifier = modifier) {
        val strokeWidth = 12.dp.toPx()
        val radius = (size.minDimension - strokeWidth) / 2
        val topLeft = Offset(
            (size.width - radius * 2) / 2,
            (size.height - radius * 2) / 2
        )
        val arcSize = androidx.compose.ui.geometry.Size(radius * 2, radius * 2)

        // Track
        drawArc(
            color = GlassBorder,
            startAngle = -90f,
            sweepAngle = 360f,
            useCenter = false,
            topLeft = topLeft,
            size = arcSize,
            style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
        )

        // Progress arc — solid color, no gradient
        if (progress > 0f) {
            drawArc(
                color = ringColor,
                startAngle = -90f,
                sweepAngle = 360f * progress,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )
        }
    }
}

@Composable
private fun GlassInfoCard(title: String, content: @Composable () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(GlassBg, RoundedCornerShape(16.dp))
            .border(1.dp, GlassBorder, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Text(
            title,
            color = Gray600,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            letterSpacing = 0.5.sp
        )
        Spacer(Modifier.height(10.dp))
        content()
    }
}

@Composable
private fun StatRow(label: String, value: String, valueColor: Color = Gray100) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Gray400, fontSize = 15.sp)
        Text(value, color = valueColor, fontSize = 15.sp, fontWeight = FontWeight.Medium)
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
