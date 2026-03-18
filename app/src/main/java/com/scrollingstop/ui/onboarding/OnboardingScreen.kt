package com.scrollingstop.ui.onboarding

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.os.Process
import android.provider.Settings
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.ui.components.GlassCard
import com.scrollingstop.ui.components.GradientButton
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

@Composable
fun OnboardingScreen(
    prefs: SecurePreferences,
    onComplete: () -> Unit
) {
    var step by remember { mutableIntStateOf(0) }
    val context = LocalContext.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepBlack)
            .drawBehind {
                // Subtle radial gradient accents in corners
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(AccentOrange.copy(alpha = 0.08f), Color.Transparent),
                        center = Offset(size.width * 0.9f, size.height * 0.1f),
                        radius = size.width * 0.7f
                    ),
                    radius = size.width * 0.7f,
                    center = Offset(size.width * 0.9f, size.height * 0.1f)
                )
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(AccentOrange.copy(alpha = 0.06f), Color.Transparent),
                        center = Offset(size.width * 0.1f, size.height * 0.85f),
                        radius = size.width * 0.6f
                    ),
                    radius = size.width * 0.6f,
                    center = Offset(size.width * 0.1f, size.height * 0.85f)
                )
            }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(48.dp))

            // Step indicator dots
            StepIndicator(currentStep = step, totalSteps = 5)

            Spacer(Modifier.height(32.dp))

            AnimatedContent(targetState = step, label = "onboarding") { currentStep ->
                when (currentStep) {
                    0 -> WelcomeStep { step = 1 }
                    1 -> PermissionsStep(context) { step = 2 }
                    2 -> LimitsStep(prefs) { step = 3 }
                    3 -> TradingSetupStep(prefs) { step = 4 }
                    4 -> ReadyStep {
                        prefs.onboardingCompleted = true
                        onComplete()
                    }
                }
            }
        }
    }
}

@Composable
private fun StepIndicator(currentStep: Int, totalSteps: Int) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        repeat(totalSteps) { index ->
            val width by animateFloatAsState(
                targetValue = if (index == currentStep) 24f else 8f,
                animationSpec = tween(300),
                label = "dot"
            )
            Box(
                modifier = Modifier
                    .height(8.dp)
                    .width(width.dp)
                    .background(
                        if (index <= currentStep) AccentOrange
                        else Gray600.copy(alpha = 0.3f),
                        CircleShape
                    )
            )
        }
    }
}

@Composable
private fun WelcomeStep(onNext: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = "ScrollStop",
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = Gray100
        )

        Spacer(Modifier.height(8.dp))

        // Gradient tagline
        Text(
            text = "Stop scrolling. Start trading.",
            fontSize = 18.sp,
            color = AccentOrange,
            fontWeight = FontWeight.Medium
        )

        Spacer(Modifier.height(40.dp))

        // Glass-morphism description card
        GlassCard {
            Text(
                text = "This app blocks social media apps after your daily time limit. " +
                        "The only way to unlock? Make a profitable trade.",
                fontSize = 15.sp,
                color = Gray400,
                lineHeight = 24.sp,
                textAlign = TextAlign.Center
            )
        }

        Spacer(Modifier.height(56.dp))

        GradientButton("Get Started", onNext)
    }
}

@Composable
private fun PermissionsStep(context: Context, onNext: () -> Unit) {
    var hasUsageStats by remember { mutableStateOf(hasUsageStatsPermission(context)) }
    var hasOverlay by remember { mutableStateOf(Settings.canDrawOverlays(context)) }
    var hasBatteryExempt by remember { mutableStateOf(isBatteryOptimized(context)) }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Permissions", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Gray100)
        Spacer(Modifier.height(8.dp))
        Text("Required for the app to work", fontSize = 14.sp, color = Gray600)
        Spacer(Modifier.height(28.dp))

        PermissionRow("Usage Access", hasUsageStats) {
            context.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })
        }

        Spacer(Modifier.height(12.dp))

        PermissionRow("Draw Over Apps", hasOverlay) {
            context.startActivity(Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${context.packageName}")
            ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) })
        }

        Spacer(Modifier.height(12.dp))

        PermissionRow("Battery Optimization", hasBatteryExempt) {
            context.startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })
        }

        Spacer(Modifier.height(28.dp))

        OutlinedButton(
            onClick = {
                hasUsageStats = hasUsageStatsPermission(context)
                hasOverlay = Settings.canDrawOverlays(context)
                hasBatteryExempt = isBatteryOptimized(context)
            },
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Gray300),
            border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                brush = Brush.linearGradient(listOf(GlassBorder, GlassBorder))
            )
        ) {
            Text("Refresh")
        }

        Spacer(Modifier.height(28.dp))

        val allGranted = hasUsageStats && hasOverlay
        GradientButton("Continue", onNext, enabled = allGranted)

        if (!allGranted) {
            Spacer(Modifier.height(8.dp))
            Text("Grant Usage Access and Overlay to continue", color = Gray600, fontSize = 12.sp)
        }
    }
}

@Composable
private fun LimitsStep(prefs: SecurePreferences, onNext: () -> Unit) {
    var limitMinutes by remember { mutableFloatStateOf(prefs.dailyLimitSeconds / 60f) }
    var profitThreshold by remember { mutableFloatStateOf(prefs.profitThresholdUsd) }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Set Your Limits", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Gray100)
        Spacer(Modifier.height(32.dp))

        GlassCard {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Daily scroll limit", color = Gray400, fontSize = 14.sp)
                Spacer(Modifier.height(4.dp))
                Text(
                    "${limitMinutes.toInt()} minutes",
                    color = Gray100,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(8.dp))
                Slider(
                    value = limitMinutes,
                    onValueChange = { limitMinutes = it },
                    valueRange = 5f..180f,
                    steps = 34,
                    modifier = Modifier.fillMaxWidth(),
                    colors = SliderDefaults.colors(
                        thumbColor = AccentOrange,
                        activeTrackColor = AccentOrange,
                        inactiveTrackColor = GlassBorder
                    )
                )
            }
        }

        Spacer(Modifier.height(20.dp))

        GlassCard {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Profit threshold to unlock", color = Gray400, fontSize = 14.sp)
                Spacer(Modifier.height(4.dp))
                Text(
                    "$${profitThreshold.toInt()}",
                    color = Gray100,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(8.dp))
                Slider(
                    value = profitThreshold,
                    onValueChange = { profitThreshold = it },
                    valueRange = 10f..1000f,
                    steps = 98,
                    modifier = Modifier.fillMaxWidth(),
                    colors = SliderDefaults.colors(
                        thumbColor = AccentOrange,
                        activeTrackColor = AccentOrange,
                        inactiveTrackColor = GlassBorder
                    )
                )
            }
        }

        Spacer(Modifier.height(36.dp))

        GradientButton("Continue", onClick = {
            prefs.dailyLimitSeconds = (limitMinutes * 60).toInt()
            prefs.profitThresholdUsd = profitThreshold
            onNext()
        })
    }
}

@Composable
private fun TradingSetupStep(prefs: SecurePreferences, onNext: () -> Unit) {
    var apiKey by remember { mutableStateOf(prefs.binanceApiKey) }
    var apiSecret by remember { mutableStateOf(prefs.binanceApiSecret) }
    var solanaAddress by remember { mutableStateOf(prefs.solanaWalletAddress) }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Connect Trading", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Gray100)
        Spacer(Modifier.height(8.dp))
        Text("Set up at least one (or skip for now)", fontSize = 14.sp, color = Gray600)
        Spacer(Modifier.height(28.dp))

        // Binance section
        GlassCard {
            Column {
                Text(
                    "Binance API (read-only)",
                    color = AccentOrange,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.5.sp
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = apiKey,
                    onValueChange = { apiKey = it },
                    label = { Text("API Key") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = glassTextFieldColors(),
                    shape = RoundedCornerShape(8.dp)
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = apiSecret,
                    onValueChange = { apiSecret = it },
                    label = { Text("API Secret") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    colors = glassTextFieldColors(),
                    shape = RoundedCornerShape(8.dp)
                )
            }
        }

        Spacer(Modifier.height(16.dp))

        // Solana section
        GlassCard {
            Column {
                Text(
                    "Solana Wallet",
                    color = AccentOrange,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.5.sp
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = solanaAddress,
                    onValueChange = { solanaAddress = it },
                    label = { Text("Wallet Address") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = glassTextFieldColors(),
                    shape = RoundedCornerShape(8.dp)
                )
            }
        }

        Spacer(Modifier.height(32.dp))

        GradientButton("Continue", onClick = {
            if (apiKey.isNotBlank() && apiSecret.isNotBlank()) {
                prefs.binanceApiKey = apiKey
                prefs.binanceApiSecret = apiSecret
            }
            if (solanaAddress.isNotBlank()) {
                prefs.solanaWalletAddress = solanaAddress
                prefs.solanaWalletVerified = true
            }
            onNext()
        })

        Spacer(Modifier.height(12.dp))

        OutlinedButton(
            onClick = onNext,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Gray600),
            border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                brush = Brush.linearGradient(listOf(GlassBorder, GlassBorder))
            )
        ) {
            Text("Skip for now")
        }
    }
}

@Composable
private fun ReadyStep(onComplete: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("You're All Set", fontSize = 32.sp, fontWeight = FontWeight.Bold, color = Gray100)

        Spacer(Modifier.height(24.dp))

        GlassCard {
            Column {
                Text(
                    "ScrollStop will now monitor your screen time " +
                            "and block social media when you hit your limit.",
                    fontSize = 15.sp,
                    color = Gray400,
                    lineHeight = 24.sp
                )

                Spacer(Modifier.height(16.dp))

                Text(
                    "To unlock, make a profitable trade on Binance or Solana. " +
                            "Or type the shame phrase to bypass.",
                    fontSize = 15.sp,
                    color = Gray400,
                    lineHeight = 24.sp
                )
            }
        }

        Spacer(Modifier.height(56.dp))

        GradientButton("Start Monitoring", onComplete)
    }
}

@Composable
private fun PermissionRow(label: String, granted: Boolean, onRequest: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(GlassBg, RoundedCornerShape(12.dp))
            .border(1.dp, if (granted) StatusGreen.copy(alpha = 0.2f) else GlassBorder, RoundedCornerShape(12.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                if (granted) Icons.Default.Check else Icons.Default.Close,
                contentDescription = null,
                tint = if (granted) StatusGreen else Gray600,
                modifier = Modifier.size(20.dp)
            )
            Spacer(Modifier.width(12.dp))
            Text(label, color = Gray100, fontSize = 15.sp)
        }

        if (!granted) {
            OutlinedButton(
                onClick = onRequest,
                colors = ButtonDefaults.outlinedButtonColors(contentColor = AccentOrange),
                border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                    brush = Brush.linearGradient(listOf(AccentOrange.copy(alpha = 0.5f), AccentOrange.copy(alpha = 0.5f)))
                ),

                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Grant", fontSize = 13.sp)
            }
        }
    }
}


@Composable
private fun glassTextFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedTextColor = Gray100,
    unfocusedTextColor = Gray300,
    focusedBorderColor = AccentOrange.copy(alpha = 0.5f),
    unfocusedBorderColor = GlassBorder,
    cursorColor = AccentOrange,
    focusedLabelColor = AccentOrange,
    unfocusedLabelColor = Gray600
)

private fun hasUsageStatsPermission(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        context.packageName
    )
    return mode == AppOpsManager.MODE_ALLOWED
}

private fun isBatteryOptimized(context: Context): Boolean {
    val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    return pm.isIgnoringBatteryOptimizations(context.packageName)
}
