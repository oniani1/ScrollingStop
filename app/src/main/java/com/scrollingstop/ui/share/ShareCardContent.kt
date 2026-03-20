package com.scrollingstop.ui.share

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.scrollingstop.ui.theme.AccentBlue
import com.scrollingstop.ui.theme.AccentViolet
import com.scrollingstop.ui.theme.DeepBlack
import com.scrollingstop.ui.theme.GlassBg
import com.scrollingstop.ui.theme.Gray100
import com.scrollingstop.ui.theme.Gray400
import com.scrollingstop.ui.theme.Gray600
import com.scrollingstop.ui.theme.StatusGreen

@Composable
fun ShareCardContent(
    streakDays: Int,
    totalProfit: Double,
    weeklyUnlocks: Int,
    weekTotalSeconds: Int
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepBlack)
            .drawBehind {
                // Corner gradient accents
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(AccentBlue.copy(alpha = 0.15f), Color.Transparent),
                        center = Offset(size.width * 0.9f, size.height * 0.05f),
                        radius = size.width * 0.5f
                    ),
                    radius = size.width * 0.5f,
                    center = Offset(size.width * 0.9f, size.height * 0.05f)
                )
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(AccentViolet.copy(alpha = 0.12f), Color.Transparent),
                        center = Offset(size.width * 0.1f, size.height * 0.95f),
                        radius = size.width * 0.5f
                    ),
                    radius = size.width * 0.5f,
                    center = Offset(size.width * 0.1f, size.height * 0.95f)
                )
            }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(60.dp))

            // Brand
            Text(
                "ScrollStop",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Gray100
            )
            Text(
                "Stop scrolling. Start trading.",
                fontSize = 14.sp,
                color = AccentBlue
            )

            Spacer(Modifier.weight(0.3f))

            // Hero stat
            if (streakDays > 0) {
                Text(
                    "$streakDays",
                    fontSize = 72.sp,
                    fontWeight = FontWeight.Bold,
                    color = Gray100
                )
                Text(
                    "days scroll-free",
                    fontSize = 20.sp,
                    color = Gray400
                )
            }

            Spacer(Modifier.height(32.dp))

            // Profit
            if (totalProfit > 0) {
                Text(
                    "$${String.format("%,.0f", totalProfit)}",
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Bold,
                    color = StatusGreen
                )
                Text(
                    "earned from forced trades",
                    fontSize = 14.sp,
                    color = Gray400
                )
            }

            Spacer(Modifier.weight(0.3f))

            // Stats row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(GlassBg, RoundedCornerShape(12.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        "$weeklyUnlocks",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Gray100
                    )
                    Text("unlocks this week", fontSize = 11.sp, color = Gray600)
                }
                Column(
                    modifier = Modifier.weight(1f),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        formatShareDuration(weekTotalSeconds),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Gray100
                    )
                    Text("screen time this week", fontSize = 11.sp, color = Gray600)
                }
            }

            Spacer(Modifier.weight(0.4f))

            // Watermark
            Text(
                "scrollstop.app",
                fontSize = 12.sp,
                color = Gray600.copy(alpha = 0.5f),
                textAlign = TextAlign.Center
            )

            Spacer(Modifier.height(20.dp))
        }
    }
}

private fun formatShareDuration(totalSeconds: Int): String {
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    return when {
        hours > 0 -> "${hours}h ${minutes}m"
        else -> "${minutes}m"
    }
}
