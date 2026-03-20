package com.scrollingstop.ui.dashboard

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
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
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.scrollingstop.ui.theme.AccentBlue
import com.scrollingstop.ui.theme.AccentViolet
import com.scrollingstop.ui.theme.BgGradientTop
import com.scrollingstop.ui.theme.DeepBlack
import com.scrollingstop.ui.theme.GlassBg
import com.scrollingstop.ui.theme.GlassBorder
import com.scrollingstop.ui.theme.Gray400
import com.scrollingstop.ui.theme.Gray500
import com.scrollingstop.ui.theme.StatusGreen
import com.scrollingstop.ui.theme.SurfaceCard
import com.scrollingstop.ui.theme.White

/**
 * 1:1 translation of stitch_dashboard.html → Jetpack Compose.
 * Every Tailwind class is noted inline.
 */
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

    // body { background: radial-gradient(circle at top center, #161625, #0A0A0F); }
    // body.flex.flex-col.p-6.max-w-md.mx-auto
    Column(
        modifier = Modifier
            .fillMaxSize()
            .drawBehind {
                drawRect(
                    brush = Brush.radialGradient(
                        colors = listOf(BgGradientTop, DeepBlack),
                        center = Offset(size.width / 2, 0f),
                        radius = size.maxDimension
                    )
                )
            }
            .padding(24.dp) // p-6
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        // ── header.flex.justify-between.items-center.mb-10 ──
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // h1.text-xl.font-bold.tracking-tight.bg-gradient-to-r.from-white.to-gray-400
            Text(
                "ScrollStop",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                style = TextStyle(brush = Brush.horizontalGradient(listOf(White, Gray400))),
                letterSpacing = (-0.5).sp // tracking-tight (-0.025em × 20sp)
            )
            // div.flex.gap-4
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                IconButton(onClick = { viewModel.refresh() }) {
                    Icon(Icons.Default.Refresh, "Refresh", tint = Gray400)
                }
                IconButton(onClick = onNavigateToSettings) {
                    Icon(Icons.Default.Settings, "Settings", tint = Gray400)
                }
            }
        }

        Spacer(Modifier.height(40.dp)) // mb-10

        // ── Forced-profit banner (app-specific, not in Stitch mockup) ──
        if (state.totalForcedProfit > 0) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(GlassBg, RoundedCornerShape(24.dp))
                    .border(1.dp, StatusGreen.copy(alpha = 0.2f), RoundedCornerShape(24.dp))
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("ScrollStop has earned you", color = Gray400, fontSize = 14.sp)
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

        // ── Circular Gauge ── div.relative.w-64.h-64.mb-8
        Box(
            modifier = Modifier.size(256.dp),
            contentAlignment = Alignment.Center
        ) {
            GaugeRing(progress = progress.coerceIn(0f, 1f), modifier = Modifier.fillMaxSize())

            // div.absolute.inset-0.flex-col.items-center.justify-center.text-center
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                // span.text-5xl.font-extrabold.tracking-tighter
                Text(
                    formatDuration(usedSeconds),
                    fontSize = 48.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = White,
                    letterSpacing = (-2.4).sp // tracking-tighter (-0.05em × 48sp)
                )
                Spacer(Modifier.height(4.dp)) // mt-1
                // span.text-gray-500.text-sm.font-medium.uppercase.tracking-widest
                Text(
                    "OF ${formatDuration(limitSeconds).uppercase()}",
                    fontSize = 14.sp,
                    color = Gray500,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 1.4.sp // tracking-widest (0.1em × 14sp)
                )
            }
        }

        Spacer(Modifier.height(32.dp)) // mb-8

        // ── Status Pill ── .glass-morphism.px-5.py-2.rounded-full.gap-2.mb-12.status-pill-shadow
        Box(
            modifier = Modifier
                .drawBehind {
                    // .status-pill-shadow { box-shadow: 0 0 20px rgba(139,92,246,0.2) }
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(AccentViolet.copy(alpha = 0.2f), Color.Transparent),
                            center = center,
                            radius = size.width * 0.5f
                        ),
                        radius = size.width * 0.5f
                    )
                }
                .background(GlassBg, CircleShape)
                .border(1.dp, GlassBorder, CircleShape)
                .padding(horizontal = 20.dp, vertical = 8.dp)
        ) {
            val isUnlocked = state.isUnlocked
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp) // gap-2
            ) {
                // i.fa-lock.text-fintech-violet.text-xs
                Icon(
                    if (isUnlocked) Icons.Default.LockOpen else Icons.Default.Lock,
                    null,
                    tint = if (isUnlocked) StatusGreen else AccentViolet,
                    modifier = Modifier.size(12.dp)
                )
                // span.text-sm.font-semibold.tracking-wide.uppercase
                Text(
                    if (isUnlocked) "UNLOCKED" else "LOCKED",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.35.sp, // tracking-wide (0.025em × 14sp)
                    color = White
                )
            }
        }

        Spacer(Modifier.height(48.dp)) // mb-12

        // ── Weekly Stats ── section.w-full.glass-morphism.rounded-3xl.p-5.mb-4
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(GlassBg, RoundedCornerShape(24.dp))
                .border(1.dp, GlassBorder, RoundedCornerShape(24.dp))
                .padding(20.dp)
        ) {
            // div.flex.justify-between.items-center.mb-4
            Text("This Week", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Gray400)
            Spacer(Modifier.height(16.dp))
            // div.grid.grid-cols-3.gap-2
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatColumn("${state.weeklyTradeUnlocks}", "Trade Unlocks", Modifier.weight(1f))
                StatColumn("${state.weeklyBypasses}", "Bypasses", Modifier.weight(1f))
                StatColumn(
                    if (state.streakDays > 0) "${state.streakDays}d" else "0d",
                    "Current Streak",
                    Modifier.weight(1f)
                )
            }
        }

        Spacer(Modifier.height(16.dp)) // mb-4

        // ── Today's Trade ── section.w-full.glass-morphism.rounded-3xl.p-5
        if (state.todayUnlock != null) {
            val unlock = state.todayUnlock!!
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(GlassBg, RoundedCornerShape(24.dp))
                    .border(1.dp, GlassBorder, RoundedCornerShape(24.dp))
                    .padding(20.dp)
            ) {
                // div.flex.justify-between.items-center.mb-4
                Text("Today's Trade", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Gray400)
                Spacer(Modifier.height(16.dp))
                // div.flex.items-center.justify-between
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // div.flex.items-center.gap-3
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // div.w-10.h-10.rounded-full.bg-orange-500/20
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(Color(0xFFF97316).copy(alpha = 0.2f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("₿", color = Color(0xFFF97316), fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                        Column {
                            // p.font-bold
                            Text(
                                unlock.source.replaceFirstChar { it.uppercase() },
                                fontWeight = FontWeight.Bold,
                                color = White
                            )
                            // p.text-xs.text-gray-500
                            Text("Trade", fontSize = 12.sp, color = Gray500)
                        }
                    }
                    // div.text-right
                    Column(horizontalAlignment = Alignment.End) {
                        // p.text-green-400.font-bold
                        Text(
                            "+$${String.format("%.2f", unlock.profitUsd)}",
                            color = StatusGreen,
                            fontWeight = FontWeight.Bold
                        )
                        // p.text-[10px].text-gray-500.uppercase.font-bold
                        Text("UNLOCKED", fontSize = 10.sp, color = Gray500, fontWeight = FontWeight.Bold)
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }

        Spacer(Modifier.height(32.dp)) // footer.mt-8

        // ── CTA Button ──
        // button.w-full.py-4.px-6.rounded-2xl.bg-gradient-to-r.from-fintech-blue.to-fintech-violet
        //       .text-white.font-bold.text-lg.shadow-lg.shadow-blue-500/20.active:scale-[0.98]
        val interactionSource = remember { MutableInteractionSource() }
        val isPressed by interactionSource.collectIsPressedAsState()
        val ctaScale by animateFloatAsState(if (isPressed) 0.98f else 1f, label = "cta")

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .scale(ctaScale)
                .drawBehind {
                    if (!state.isCheckingTrade) {
                        // shadow-lg shadow-blue-500/20
                        drawRoundRect(
                            color = AccentBlue.copy(alpha = 0.2f),
                            topLeft = Offset(0f, 6.dp.toPx()),
                            size = size,
                            cornerRadius = CornerRadius(16.dp.toPx())
                        )
                    }
                }
                .background(
                    if (!state.isCheckingTrade) Brush.horizontalGradient(
                        listOf(AccentBlue, AccentViolet)
                    ) else Brush.horizontalGradient(
                        listOf(SurfaceCard, SurfaceCard)
                    ),
                    RoundedCornerShape(16.dp)
                )
                .clickable(
                    interactionSource = interactionSource,
                    indication = null,
                    enabled = !state.isCheckingTrade
                ) { viewModel.checkTrade() }
                .padding(vertical = 16.dp, horizontal = 24.dp),
            contentAlignment = Alignment.Center
        ) {
            if (state.isCheckingTrade) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    CircularProgressIndicator(Modifier.size(18.dp), color = White, strokeWidth = 2.dp)
                    Spacer(Modifier.width(8.dp))
                    Text("Checking...", color = White)
                }
            } else {
                Text("Check for trades", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = White)
            }
        }

        state.tradeCheckMessage?.let {
            Spacer(Modifier.height(8.dp))
            Text(it, color = Gray400, fontSize = 13.sp)
        }

        Spacer(Modifier.height(16.dp)) // pb-4
    }
}

// ── Stat Column ── div.flex.flex-col inside grid-cols-3
@Composable
private fun StatColumn(value: String, label: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        // span.text-xl.font-bold
        Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = White)
        // span.text-[10px].uppercase.text-gray-500.font-bold.tracking-tighter
        Text(
            label.uppercase(),
            fontSize = 10.sp,
            color = Gray500,
            fontWeight = FontWeight.Bold,
            letterSpacing = (-0.5).sp // tracking-tighter (-0.05em × 10sp)
        )
    }
}

// ── Gauge Ring ── SVG circle with linearGradient stroke
@Composable
private fun GaugeRing(progress: Float, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val strokeWidth = 12.dp.toPx()
        // SVG: <circle r="110"> in 256×256 viewport
        val radius = size.minDimension * (110f / 256f)
        val topLeft = Offset(
            (size.width - radius * 2) / 2,
            (size.height - radius * 2) / 2
        )
        val arcSize = Size(radius * 2, radius * 2)

        // Background track: stroke="rgba(255,255,255,0.05)" stroke-width="12"
        drawArc(
            color = Color.White.copy(alpha = 0.05f),
            startAngle = -90f,
            sweepAngle = 360f,
            useCenter = false,
            topLeft = topLeft,
            size = arcSize,
            style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
        )

        // Progress arc: linearGradient #4F8CFF → #8B5CF6
        // SVG has transform -rotate-90 so gradient runs bottom→top in screen space
        if (progress > 0f) {
            drawArc(
                brush = Brush.linearGradient(
                    colors = listOf(AccentBlue, AccentViolet),
                    start = Offset(center.x, topLeft.y + arcSize.height),
                    end = Offset(center.x, topLeft.y)
                ),
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

private fun formatDuration(totalSeconds: Int): String {
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    return when {
        hours > 0 -> "${hours}h ${minutes}m"
        else -> "${minutes}m"
    }
}
