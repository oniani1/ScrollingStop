package com.scrollingstop.ui.stats

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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Share
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.scrollingstop.ui.share.ShareCardGenerator
import com.scrollingstop.ui.theme.AccentOrange
import com.scrollingstop.ui.theme.DeepBlack
import com.scrollingstop.ui.theme.GlassBg
import com.scrollingstop.ui.theme.GlassBorder
import com.scrollingstop.ui.theme.Gray100
import com.scrollingstop.ui.theme.Gray300
import com.scrollingstop.ui.theme.Gray400
import com.scrollingstop.ui.theme.Gray600
import com.scrollingstop.ui.theme.StatusGreen
import com.scrollingstop.ui.theme.SurfaceCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(
    onBack: () -> Unit,
    viewModel: StatsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text("Stats", color = Gray100, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Gray400)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        ShareCardGenerator.shareStats(context, state)
                    }) {
                        Icon(Icons.Default.Share, contentDescription = "Share", tint = Gray400)
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
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(Modifier.height(8.dp))

            // Time This Week
            StatsCard("Time This Week") {
                StatRow("Total", formatDuration(state.weekTotalSeconds))
                StatRow("Daily average", formatDuration(state.weekDailyAvgSeconds))
            }

            Spacer(Modifier.height(12.dp))

            // vs Last Week
            val diff = state.weekTotalSeconds - state.lastWeekTotalSeconds
            val diffText = when {
                diff < 0 -> "\u2193 ${formatDuration(-diff)} less than last week"
                diff > 0 -> "\u2191 ${formatDuration(diff)} more than last week"
                else -> "Same as last week"
            }
            val diffColor = when {
                diff < 0 -> StatusGreen
                diff > 0 -> Color(0xFFEF4444)
                else -> Gray400
            }
            StatsCard("vs Last Week") {
                Text(diffText, color = diffColor, fontSize = 15.sp, fontWeight = FontWeight.Medium)
            }

            Spacer(Modifier.height(12.dp))

            // Per-App Breakdown
            if (state.perAppUsage.isNotEmpty()) {
                StatsCard("Per-App Breakdown") {
                    val maxUsage = state.perAppUsage.maxOfOrNull { it.usedSeconds } ?: 1
                    state.perAppUsage.forEach { app ->
                        val appName = app.packageName.substringAfterLast(".")
                            .replaceFirstChar { it.uppercase() }
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                appName,
                                color = Gray300,
                                fontSize = 14.sp,
                                modifier = Modifier.width(80.dp),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(Modifier.width(8.dp))
                            Box(modifier = Modifier.weight(1f)) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth(app.usedSeconds.toFloat() / maxUsage)
                                        .height(8.dp)
                                        .background(
                                            AccentOrange.copy(alpha = 0.6f),
                                            RoundedCornerShape(4.dp)
                                        )
                                )
                            }
                            Spacer(Modifier.width(8.dp))
                            Text(
                                formatDuration(app.usedSeconds),
                                color = Gray400,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
                Spacer(Modifier.height(12.dp))
            }

            // Trading Performance
            StatsCard("Trading Performance") {
                StatRow("Lifetime profit", "$${String.format("%,.2f", state.totalProfit)}", StatusGreen)
                StatRow("Total trade unlocks", "${state.totalTradeCount}")
                StatRow("Best single trade", "$${String.format("%.2f", state.bestTrade)}")
            }

            Spacer(Modifier.height(12.dp))

            // Bypass History
            StatsCard("Bypass History") {
                StatRow("This week", "${state.bypassesThisWeek}")
                StatRow("Last week", "${state.bypassesLastWeek}")
                StatRow("All time", "${state.bypassesAllTime}")
            }

            Spacer(Modifier.height(20.dp))

            // Achievements
            Text(
                "ACHIEVEMENTS",
                color = Gray600,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 1.sp
            )
            Spacer(Modifier.height(12.dp))

            // Achievement grid - use fixed height columns instead of LazyVerticalGrid inside scroll
            val chunked = state.achievements.chunked(2)
            chunked.forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    row.forEach { item ->
                        AchievementCard(
                            item = item,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (row.size == 1) {
                        Spacer(Modifier.weight(1f))
                    }
                }
                Spacer(Modifier.height(12.dp))
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun StatsCard(title: String, content: @Composable () -> Unit) {
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

@Composable
private fun AchievementCard(item: AchievementDisplay, modifier: Modifier = Modifier) {
    val isUnlocked = item.achievement.unlockedAt != null
    Column(
        modifier = modifier
            .background(
                if (isUnlocked) GlassBg else SurfaceCard.copy(alpha = 0.3f),
                RoundedCornerShape(12.dp)
            )
            .border(
                1.dp,
                if (isUnlocked) AccentOrange.copy(alpha = 0.3f) else GlassBorder,
                RoundedCornerShape(12.dp)
            )
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (!isUnlocked) {
            Icon(
                Icons.Default.Lock,
                contentDescription = null,
                tint = Gray600,
                modifier = Modifier.size(24.dp)
            )
        }
        Spacer(Modifier.height(4.dp))
        Text(
            item.def.title,
            color = if (isUnlocked) Gray100 else Gray600,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        Spacer(Modifier.height(2.dp))
        Text(
            item.def.description,
            color = if (isUnlocked) Gray400 else Gray600.copy(alpha = 0.5f),
            fontSize = 11.sp,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        val unlockedAt = item.achievement.unlockedAt
        if (unlockedAt != null) {
            Spacer(Modifier.height(4.dp))
            val date = java.time.ZoneId.systemDefault().let { zone ->
                java.time.LocalDateTime.ofInstant(unlockedAt, zone).toLocalDate()
            }
            Text(
                date.toString(),
                color = AccentOrange.copy(alpha = 0.7f),
                fontSize = 10.sp
            )
        }
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
