package com.scrollingstop.ui.overlay

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
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
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.scrollingstop.ui.theme.AccentBlue
import com.scrollingstop.ui.theme.AccentViolet
import com.scrollingstop.ui.theme.GlassBg
import com.scrollingstop.ui.theme.GlassBorder
import com.scrollingstop.ui.theme.GlassBorderLight
import com.scrollingstop.ui.theme.Gray100
import com.scrollingstop.ui.theme.Gray300
import com.scrollingstop.ui.theme.Gray400
import com.scrollingstop.ui.theme.Gray600
import com.scrollingstop.ui.theme.StatusGreen
import com.scrollingstop.ui.theme.StatusRed
import com.scrollingstop.ui.theme.SurfaceCard

@Composable
fun BlockOverlayContent(
    usedSeconds: Int,
    limitSeconds: Int,
    streakDays: Int,
    streakShields: Int = 0,
    showCelebration: Boolean = false,
    celebrationProfit: Double = 0.0,
    isCheckingTrade: Boolean,
    tradeCheckResult: String?,
    onBypassConfirmed: () -> Unit,
    onTradeCheckRequested: () -> Unit,
    onOpenBinance: () -> Unit,
    onOpenPhantom: () -> Unit,
    bypassPhrase: String,
    hasBinance: Boolean,
    hasSolana: Boolean
) {
    var bypassInput by remember { mutableStateOf("") }
    val usedFormatted = formatDuration(usedSeconds)

    // Pulsing glow animation
    val infiniteTransition = rememberInfiniteTransition(label = "glow")
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.10f,
        targetValue = 0.20f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glowAlpha"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF050505))
            .drawBehind {
                // Red/amber urgency vignette
                drawRect(
                    brush = Brush.radialGradient(
                        colors = listOf(Color.Transparent, StatusRed.copy(alpha = glowAlpha)),
                        center = Offset(size.width / 2, size.height / 2),
                        radius = size.maxDimension * 0.8f
                    )
                )
                // Lock icon glow
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(AccentBlue.copy(alpha = 0.08f), Color.Transparent),
                        center = Offset(size.width / 2, size.height * 0.12f),
                        radius = size.width * 0.4f
                    ),
                    radius = size.width * 0.4f,
                    center = Offset(size.width / 2, size.height * 0.12f)
                )
            }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 28.dp, vertical = 56.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(24.dp))

            // Glowing lock icon
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .drawBehind {
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(AccentBlue.copy(alpha = 0.25f), Color.Transparent),
                                radius = size.width
                            )
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = null,
                    tint = Gray100,
                    modifier = Modifier.size(40.dp)
                )
            }

            Spacer(Modifier.height(20.dp))

            Text(
                text = "TIME'S UP",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Gray100,
                letterSpacing = 4.sp
            )

            Spacer(Modifier.height(12.dp))

            Text(
                text = "You've scrolled for $usedFormatted today",
                fontSize = 16.sp,
                color = Gray400,
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(32.dp))

            // Trade unlock card — glass-morphism with gradient border
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(GlassBg, RoundedCornerShape(16.dp))
                    .border(
                        1.dp,
                        AccentBlue.copy(alpha = 0.3f),
                        RoundedCornerShape(16.dp)
                    )
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "TRADE TO UNLOCK",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = AccentBlue,
                    letterSpacing = 2.sp
                )

                Spacer(Modifier.height(16.dp))

                if (hasBinance) {
                    TradeStatusRow("Binance", true)
                }
                if (hasSolana) {
                    if (hasBinance) Spacer(Modifier.height(8.dp))
                    TradeStatusRow("Solana", true)
                }
                if (!hasBinance && !hasSolana) {
                    Text("No trading accounts connected", color = Gray600, fontSize = 14.sp)
                }
            }

            Spacer(Modifier.height(16.dp))

            // Quick launch buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onOpenBinance,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Gray300),
                    border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                        brush = Brush.linearGradient(listOf(GlassBorderLight, GlassBorderLight))
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Open Binance", fontSize = 13.sp)
                }

                OutlinedButton(
                    onClick = onOpenPhantom,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Gray300),
                    border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                        brush = Brush.linearGradient(listOf(GlassBorderLight, GlassBorderLight))
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Open Phantom", fontSize = 13.sp)
                }
            }

            Spacer(Modifier.height(16.dp))

            // Primary CTA — gradient "Check for trades" button with glow
            Button(
                onClick = onTradeCheckRequested,
                modifier = Modifier
                    .fillMaxWidth()
                    .drawBehind {
                        if (!isCheckingTrade) {
                            drawRoundRect(
                                brush = Brush.radialGradient(
                                    colors = listOf(AccentBlue.copy(alpha = 0.3f), Color.Transparent),
                                    center = center,
                                    radius = size.width * 0.6f
                                ),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(12.dp.toPx())
                            )
                        }
                    },
                enabled = !isCheckingTrade,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Transparent,
                    contentColor = Color.White,
                    disabledContainerColor = SurfaceCard,
                    disabledContentColor = Gray600
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            if (!isCheckingTrade) AccentViolet else SurfaceCard,
                            RoundedCornerShape(12.dp)
                        )
                        .padding(vertical = 6.dp),
                    contentAlignment = Alignment.Center
                ) {
                    if (isCheckingTrade) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CircularProgressIndicator(Modifier.size(18.dp), color = Gray400, strokeWidth = 2.dp)
                            Spacer(Modifier.width(8.dp))
                            Text("Checking...")
                        }
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Refresh, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("I just made a trade — check now", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            // Trade check result
            AnimatedVisibility(
                visible = tradeCheckResult != null,
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                Text(
                    text = tradeCheckResult ?: "",
                    fontSize = 13.sp,
                    color = Gray400,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            Spacer(Modifier.height(28.dp))

            HorizontalDivider(color = GlassBorder)

            Spacer(Modifier.height(28.dp))

            // Bypass section — intentionally muted and unattractive
            Text(
                text = "Or type the shame phrase to bypass:",
                fontSize = 13.sp,
                color = Gray600.copy(alpha = 0.7f)
            )

            Spacer(Modifier.height(8.dp))

            Text(
                text = "\"$bypassPhrase\"",
                fontSize = 13.sp,
                color = Gray600.copy(alpha = 0.5f),
                textAlign = TextAlign.Center,
                fontWeight = FontWeight.Medium,
                fontFamily = FontFamily.Monospace
            )

            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = bypassInput,
                onValueChange = { newValue ->
                    bypassInput = newValue
                    if (newValue.trim().equals(bypassPhrase, ignoreCase = true)) {
                        onBypassConfirmed()
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Type the phrase above...", color = Gray600.copy(alpha = 0.5f)) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Gray400,
                    unfocusedTextColor = Gray400,
                    focusedBorderColor = Gray600.copy(alpha = 0.3f),
                    unfocusedBorderColor = GlassBorder,
                    cursorColor = Gray400
                ),
                shape = RoundedCornerShape(8.dp),
                singleLine = true
            )

            // Streak counter
            if (streakDays > 0) {
                Spacer(Modifier.height(28.dp))
                Row(
                    modifier = Modifier
                        .background(GlassBg, CircleShape)
                        .border(1.dp, AccentBlue.copy(alpha = 0.2f), CircleShape)
                        .padding(horizontal = 20.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "$streakDays-day trade streak — don't break it!",
                        fontSize = 14.sp,
                        color = AccentBlue,
                        fontWeight = FontWeight.Medium
                    )
                    if (streakShields > 0) {
                        Spacer(Modifier.width(8.dp))
                        Icon(
                            Icons.Default.Shield,
                            contentDescription = null,
                            tint = AccentBlue,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "x$streakShields",
                            fontSize = 13.sp,
                            color = AccentBlue,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(Modifier.height(32.dp))
        }

        // Celebration overlay
        if (showCelebration) {
            ConfettiEffect(Modifier.fillMaxSize())
            AnimatedVisibility(
                visible = true,
                enter = slideInVertically(initialOffsetY = { it }) + fadeIn()
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "+$${String.format("%.2f", celebrationProfit)}",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold,
                        color = StatusGreen
                    )
                }
            }
        }
    }
}

@Composable
private fun TradeStatusRow(source: String, connected: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(source, color = Gray300, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(if (connected) StatusGreen else StatusRed, CircleShape)
            )
            Spacer(Modifier.width(6.dp))
            Text(
                if (connected) "Connected" else "Not connected",
                color = if (connected) StatusGreen else Gray600,
                fontSize = 13.sp
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
