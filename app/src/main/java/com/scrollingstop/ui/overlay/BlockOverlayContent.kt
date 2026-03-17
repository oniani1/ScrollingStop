package com.scrollingstop.ui.overlay

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material.icons.filled.Refresh
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.scrollingstop.ui.theme.Gray100
import com.scrollingstop.ui.theme.Gray300
import com.scrollingstop.ui.theme.Gray400
import com.scrollingstop.ui.theme.Gray600
import com.scrollingstop.ui.theme.Gray800
import com.scrollingstop.ui.theme.Gray900
import com.scrollingstop.ui.theme.Gray950

@Composable
fun BlockOverlayContent(
    usedSeconds: Int,
    limitSeconds: Int,
    streakDays: Int,
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Gray950.copy(alpha = 0.97f))
            .padding(horizontal = 32.dp, vertical = 64.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(32.dp))

        // Lock icon
        Icon(
            imageVector = Icons.Default.Lock,
            contentDescription = null,
            tint = Gray300,
            modifier = Modifier.size(48.dp)
        )

        Spacer(Modifier.height(16.dp))

        Text(
            text = "TIME'S UP",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Gray100,
            letterSpacing = 2.sp
        )

        Spacer(Modifier.height(12.dp))

        Text(
            text = "You've scrolled for $usedFormatted today",
            fontSize = 16.sp,
            color = Gray400,
            textAlign = TextAlign.Center,
        )

        Spacer(Modifier.height(32.dp))

        // Trade unlock card
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Gray900, RoundedCornerShape(12.dp))
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "MAKE A TRADE TO UNLOCK",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Gray100,
                letterSpacing = 1.sp
            )

            Spacer(Modifier.height(16.dp))

            if (hasBinance) {
                TradeStatusRow("Binance", "No qualifying trade today")
            }
            if (hasSolana) {
                if (hasBinance) Spacer(Modifier.height(6.dp))
                TradeStatusRow("Solana", "No qualifying trade today")
            }
            if (!hasBinance && !hasSolana) {
                Text("No trading accounts connected", color = Gray600, fontSize = 14.sp)
            }
        }

        Spacer(Modifier.height(20.dp))

        // Quick launch buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedButton(
                onClick = onOpenBinance,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Gray300),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Open Binance")
            }

            OutlinedButton(
                onClick = onOpenPhantom,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Gray300),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Open Phantom")
            }
        }

        Spacer(Modifier.height(12.dp))

        // Check trade button
        Button(
            onClick = onTradeCheckRequested,
            modifier = Modifier.fillMaxWidth(),
            enabled = !isCheckingTrade,
            colors = ButtonDefaults.buttonColors(
                containerColor = Gray800,
                contentColor = Gray100
            ),
            shape = RoundedCornerShape(8.dp)
        ) {
            if (isCheckingTrade) {
                CircularProgressIndicator(
                    modifier = Modifier.size(18.dp),
                    color = Gray400,
                    strokeWidth = 2.dp
                )
                Spacer(Modifier.width(8.dp))
                Text("Checking...")
            } else {
                Icon(
                    Icons.Default.Refresh,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text("I just made a trade — check now")
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

        Spacer(Modifier.height(24.dp))

        HorizontalDivider(color = Gray800)

        Spacer(Modifier.height(24.dp))

        // Bypass section
        Text(
            text = "Or type to bypass:",
            fontSize = 14.sp,
            color = Gray600
        )

        Spacer(Modifier.height(4.dp))

        Text(
            text = "\"$bypassPhrase\"",
            fontSize = 13.sp,
            color = Gray600,
            textAlign = TextAlign.Center,
            fontWeight = FontWeight.Medium
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
            placeholder = { Text("Type the phrase above...", color = Gray600) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Gray300,
                unfocusedTextColor = Gray300,
                focusedBorderColor = Gray600,
                unfocusedBorderColor = Gray800,
                cursorColor = Gray300
            ),
            shape = RoundedCornerShape(8.dp),
            singleLine = true
        )

        // Streak counter
        if (streakDays > 0) {
            Spacer(Modifier.height(24.dp))
            Text(
                text = "$streakDays-day trade streak",
                fontSize = 14.sp,
                color = Gray400,
                fontWeight = FontWeight.Medium
            )
        }

        Spacer(Modifier.height(32.dp))
    }
}

@Composable
private fun TradeStatusRow(source: String, status: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text("$source:", color = Gray400, fontSize = 14.sp)
        Text(status, color = Gray600, fontSize = 14.sp)
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
