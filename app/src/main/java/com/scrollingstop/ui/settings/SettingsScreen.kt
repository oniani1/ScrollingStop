package com.scrollingstop.ui.settings

import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.outlined.RemoveCircleOutline
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.ui.theme.AccentBlue
import com.scrollingstop.ui.theme.AccentViolet
import com.scrollingstop.ui.theme.Gray400
import com.scrollingstop.ui.theme.Gray500
import com.scrollingstop.ui.theme.SettingsBg
import com.scrollingstop.ui.theme.Slate300
import com.scrollingstop.ui.theme.SlateCard
import com.scrollingstop.ui.theme.SlateBorder
import com.scrollingstop.ui.theme.SlateDivider
import com.scrollingstop.ui.theme.StatusGreen
import com.scrollingstop.ui.theme.StatusRed
import com.scrollingstop.ui.theme.SurfaceDark
import com.scrollingstop.ui.theme.White
import kotlin.math.roundToInt

/**
 * 1:1 translation of stitch_settings.html → Jetpack Compose.
 * Every Tailwind class is noted inline.
 */
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val blockedApps by viewModel.blockedApps.collectAsState(initial = emptyList())
    val prefs = viewModel.prefs
    var showAppPicker by remember { mutableStateOf(false) }
    var showBinanceDialog by remember { mutableStateOf(false) }
    var showSolanaDialog by remember { mutableStateOf(false) }

    // body.bg-background-dark.font-display.text-slate-100.antialiased.min-h-screen.pb-24
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SettingsBg)
    ) {

        // ── header.sticky.bg-background-dark/80.backdrop-blur-xl.border-b.border-slate-800.px-4.h-16.flex.items-center.gap-4 ──
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp) // h-16
                .background(SettingsBg.copy(alpha = 0.8f))
                .padding(horizontal = 16.dp), // px-4
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp) // gap-4
        ) {
            // button.size-10.rounded-full
            IconButton(onClick = onBack, modifier = Modifier.size(40.dp)) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = White)
            }
            // h1.text-xl.font-bold.tracking-tight
            Text(
                "Settings",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = White,
                letterSpacing = (-0.5).sp // tracking-tight (-0.025em × 20sp)
            )
        }
        // border-b border-slate-800
        HorizontalDivider(color = SlateBorder, thickness = 1.dp)

        // ── main.p-4.space-y-6 ──
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp), // p-4
            verticalArrangement = Arrangement.spacedBy(24.dp) // space-y-6
        ) {

            // ══════════════════════════════════════════
            // BLOCKED APPS — section.space-y-3
            // ══════════════════════════════════════════
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    SectionHeader("Blocked Apps")

                    // div.bg-slate-900/50.border.border-slate-800.rounded-xl.overflow-hidden.backdrop-blur-md
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(SlateCard, RoundedCornerShape(12.dp))
                            .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
                    ) {
                        // div.divide-y.divide-slate-800 — app items
                        blockedApps.forEachIndexed { index, app ->
                            // div.flex.items-center.justify-between.p-4
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                // div.flex.items-center.gap-3
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    // div.size-10.rounded-lg.bg-gradient-to-tr
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .background(
                                                getAppIconGradient(app.displayName),
                                                RoundedCornerShape(8.dp)
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        // span.text-white.font-bold.text-xs
                                        Text(
                                            getAppAbbrev(app.displayName),
                                            color = White,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    // span.font-medium
                                    Text(app.displayName, fontWeight = FontWeight.Medium, color = White)
                                }
                                // button.text-slate-400 → material-symbols: remove_circle_outline
                                IconButton(
                                    onClick = { viewModel.removeApp(app.packageName) },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        Icons.Outlined.RemoveCircleOutline,
                                        contentDescription = "Remove",
                                        tint = Gray400,
                                        modifier = Modifier.size(22.dp)
                                    )
                                }
                            }
                            if (index < blockedApps.lastIndex) {
                                HorizontalDivider(color = SlateDivider)
                            }
                        }

                        if (blockedApps.isEmpty()) {
                            Text(
                                "No apps blocked yet",
                                color = Gray500,
                                fontSize = 14.sp,
                                modifier = Modifier.padding(16.dp)
                            )
                        }

                        // button.w-full.p-4.text-primary.font-semibold.flex.items-center.justify-center.gap-2.border-t
                        HorizontalDivider(color = SlateDivider)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showAppPicker = true }
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // span.material-symbols-outlined.text-sm → add
                            Icon(Icons.Default.Add, null, tint = AccentBlue, modifier = Modifier.size(14.dp))
                            Spacer(Modifier.width(8.dp)) // gap-2
                            Text("Add App", color = AccentBlue, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            // ══════════════════════════════════════════
            // LIMITS — section.space-y-3
            // ══════════════════════════════════════════
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    SectionHeader("Limits")

                    // div.bg-slate-900/50.border.border-slate-800.rounded-xl.p-5.space-y-6
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(SlateCard, RoundedCornerShape(12.dp))
                            .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
                            .padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(24.dp) // space-y-6
                    ) {
                        LimitSliderRow(
                            label = "Daily Limit",
                            value = prefs.dailyLimitSeconds / 60f,
                            range = 5f..180f,
                            steps = 34,
                            formatValue = { "${it.toInt()} minutes" },
                            onValueChange = { prefs.dailyLimitSeconds = (it * 60).toInt() }
                        )
                        LimitSliderRow(
                            label = "Profit Threshold",
                            value = prefs.profitThresholdUsd,
                            range = 10f..1000f,
                            steps = 98,
                            formatValue = { "$${it.toInt()}" },
                            onValueChange = { prefs.profitThresholdUsd = it }
                        )
                    }
                }
            }

            // ══════════════════════════════════════════
            // TRADING CONNECTIONS — section.space-y-3
            // ══════════════════════════════════════════
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    SectionHeader("Trading Connections")

                    // div.bg-slate-900/50.border.border-slate-800.rounded-xl.overflow-hidden
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(SlateCard, RoundedCornerShape(12.dp))
                            .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
                    ) {
                        // ── Binance row ── div.flex.items-center.justify-between.p-4
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showBinanceDialog = true }
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp) // gap-3
                            ) {
                                // div.size-8.rounded-full.bg-yellow-500/20
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .background(Color(0xFFEAB308).copy(alpha = 0.2f), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("₿", color = Color(0xFFEAB308), fontSize = 16.sp)
                                }
                                // span.font-medium
                                Text("Binance API", fontWeight = FontWeight.Medium, color = White)
                            }
                            ConnectionBadge(prefs.hasBinanceKeys)
                        }

                        HorizontalDivider(color = SlateDivider) // divide-y divide-slate-800

                        // ── Solana row ── div.flex.items-center.justify-between.p-4
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showSolanaDialog = true }
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // div.size-8.rounded-full.bg-purple-500/20
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .background(AccentViolet.copy(alpha = 0.2f), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("◎", color = AccentViolet, fontSize = 16.sp)
                                }
                                Text("Solana Wallet", fontWeight = FontWeight.Medium, color = White)
                            }
                            if (prefs.hasSolanaWallet) {
                                ConnectionBadge(true)
                            } else {
                                // button.px-4.py-1.5.border.border-primary/30.text-primary.text-sm.font-semibold.rounded-lg
                                Text(
                                    "Connect",
                                    color = AccentBlue,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier
                                        .border(1.dp, AccentBlue.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                        .padding(horizontal = 16.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }
            }

            // ══════════════════════════════════════════
            // BYPASS — section.space-y-3
            // ══════════════════════════════════════════
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    SectionHeader("Bypass")

                    // div.bg-slate-900/50.border.border-slate-800.rounded-xl.p-4
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(SlateCard, RoundedCornerShape(12.dp))
                            .border(1.dp, SlateBorder, RoundedCornerShape(12.dp))
                            .padding(16.dp)
                    ) {
                        // label.block.text-sm.font-medium.mb-2.text-slate-400
                        Text("Shame Phrase", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Gray400)
                        Spacer(Modifier.height(8.dp)) // mb-2
                        // div.relative — input-like display
                        // input.bg-slate-800.border-none.rounded-lg.p-3.text-sm.text-slate-300
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SlateBorder, RoundedCornerShape(8.dp))
                                .padding(12.dp), // p-3
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                prefs.bypassPhrase,
                                fontSize = 14.sp,
                                color = Slate300 // dark:text-slate-300
                            )
                            // span.material-symbols-outlined.text-slate-500.text-lg → lock
                            Icon(Icons.Default.Lock, null, tint = Gray500, modifier = Modifier.size(18.dp))
                        }
                        Spacer(Modifier.height(8.dp)) // mt-2
                        // p.text-xs.text-slate-500.italic
                        Text(
                            "You must type this exact phrase to disable your blocks.",
                            fontSize = 12.sp,
                            color = Gray500
                        )
                    }
                }
            }

            item { Spacer(Modifier.height(32.dp)) } // pb-24
        }
    }

    // ── Dialogs ──
    if (showAppPicker) {
        AppPickerDialog(
            blockedPackages = blockedApps.map { it.packageName }.toSet(),
            onSelect = { pkg, name -> viewModel.addApp(pkg, name) },
            onDismiss = { showAppPicker = false }
        )
    }
    if (showBinanceDialog) {
        BinanceKeyDialog(prefs = prefs, onDismiss = { showBinanceDialog = false })
    }
    if (showSolanaDialog) {
        SolanaWalletDialog(prefs = prefs, onDismiss = { showSolanaDialog = false })
    }
}

// ── h2.px-1.text-sm.font-semibold.uppercase.tracking-wider.text-slate-400 ──
@Composable
private fun SectionHeader(title: String) {
    Text(
        title.uppercase(),
        color = Gray400,
        fontSize = 14.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 0.7.sp, // tracking-wider (0.05em × 14sp)
        modifier = Modifier.padding(horizontal = 4.dp) // px-1
    )
}

// ── span.px-3.py-1.bg-green-500/10.text-green-500.text-xs.font-bold.rounded-full.border.border-green-500/20.uppercase ──
@Composable
private fun ConnectionBadge(connected: Boolean) {
    Text(
        if (connected) "Connected" else "Not Connected",
        color = if (connected) StatusGreen else Gray500,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        modifier = Modifier
            .background(
                if (connected) StatusGreen.copy(alpha = 0.1f) else Color.Transparent,
                CircleShape
            )
            .then(
                if (connected) Modifier.border(1.dp, StatusGreen.copy(alpha = 0.2f), CircleShape)
                else Modifier
            )
            .padding(horizontal = 12.dp, vertical = 4.dp) // px-3 py-1
    )
}

// ── Limit Slider Row ── div.space-y-3 with label + custom slider
@Composable
private fun LimitSliderRow(
    label: String,
    value: Float,
    range: ClosedFloatingPointRange<Float>,
    steps: Int,
    formatValue: (Float) -> String,
    onValueChange: (Float) -> Unit
) {
    var sliderValue by remember { mutableFloatStateOf(value) }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) { // space-y-3
        // div.flex.justify-between.items-end
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Bottom
        ) {
            // label.font-medium
            Text(label, fontWeight = FontWeight.Medium, color = White)
            // span.text-primary.font-bold
            Text(formatValue(sliderValue), color = AccentBlue, fontWeight = FontWeight.Bold)
        }
        // Custom slider: h-2 gradient track + size-5 white thumb with border-2 border-primary
        GradientSlider(
            value = sliderValue,
            onValueChange = { sliderValue = it },
            onValueChangeFinished = { onValueChange(sliderValue) },
            valueRange = range,
            steps = steps
        )
    }
}

// ── Custom Slider ── matches Stitch HTML: h-2 rounded-full track + gradient fill + size-5 white thumb
@Composable
private fun GradientSlider(
    value: Float,
    onValueChange: (Float) -> Unit,
    onValueChangeFinished: () -> Unit,
    valueRange: ClosedFloatingPointRange<Float>,
    steps: Int = 0
) {
    val rangeSize = valueRange.endInclusive - valueRange.start
    val fraction = ((value - valueRange.start) / rangeSize).coerceIn(0f, 1f)

    fun fractionToValue(rawFraction: Float): Float {
        val f = rawFraction.coerceIn(0f, 1f)
        if (steps <= 0) return valueRange.start + f * rangeSize
        val intervals = steps + 1
        val step = 1f / intervals
        val snapped = ((f / step).roundToInt() * step).coerceIn(0f, 1f)
        return valueRange.start + snapped * rangeSize
    }

    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(24.dp) // enough room for size-5 (20dp) thumb
            .pointerInput(valueRange) {
                detectHorizontalDragGestures(
                    onDragEnd = { onValueChangeFinished() }
                ) { change, _ ->
                    change.consume()
                    val thumbR = 10.dp.toPx()
                    val trackW = size.width - thumbR * 2
                    val f = ((change.position.x - thumbR) / trackW).coerceIn(0f, 1f)
                    onValueChange(fractionToValue(f))
                }
            }
            .pointerInput(valueRange) {
                detectTapGestures { offset ->
                    val thumbR = 10.dp.toPx()
                    val trackW = size.width - thumbR * 2
                    val f = ((offset.x - thumbR) / trackW).coerceIn(0f, 1f)
                    onValueChange(fractionToValue(f))
                    onValueChangeFinished()
                }
            }
    ) {
        val thumbR = 10.dp.toPx() // size-5 = 20dp → radius 10dp
        val trackH = 8.dp.toPx()  // h-2 = 8dp
        val trackW = size.width - thumbR * 2
        val trackY = center.y - trackH / 2

        // Inactive track: bg-slate-800 rounded-full
        drawRoundRect(
            color = SlateBorder,
            topLeft = Offset(thumbR, trackY),
            size = Size(trackW, trackH),
            cornerRadius = CornerRadius(trackH / 2)
        )

        // Active track: bg-gradient-to-r from-primary to-purple-500 rounded-full
        val activeW = fraction * trackW
        if (activeW > 0) {
            drawRoundRect(
                brush = Brush.horizontalGradient(
                    listOf(AccentBlue, AccentViolet),
                    startX = thumbR,
                    endX = thumbR + trackW
                ),
                topLeft = Offset(thumbR, trackY),
                size = Size(activeW, trackH),
                cornerRadius = CornerRadius(trackH / 2)
            )
        }

        // Thumb: size-5 bg-white border-2 border-primary rounded-full shadow-lg
        val thumbX = thumbR + fraction * trackW
        // shadow
        drawCircle(
            color = Color.Black.copy(alpha = 0.15f),
            radius = thumbR + 1.dp.toPx(),
            center = Offset(thumbX, center.y + 1.dp.toPx())
        )
        // white fill
        drawCircle(color = White, radius = thumbR, center = Offset(thumbX, center.y))
        // border-2 border-primary
        drawCircle(
            color = AccentBlue,
            radius = thumbR,
            center = Offset(thumbX, center.y),
            style = Stroke(width = 2.dp.toPx())
        )
    }
}

// ── App icon gradient ── bg-gradient-to-tr (bottom-left → top-right)
private fun getAppIconGradient(appName: String): Brush {
    val colors = when (appName.lowercase()) {
        "instagram" -> listOf(Color(0xFFA855F7), Color(0xFFEC4899))
        "tiktok" -> listOf(Color(0xFF000000), Color(0xFF1A1A1A))
        "youtube" -> listOf(Color(0xFFEF4444), Color(0xFFDC2626))
        "x (twitter)", "twitter" -> listOf(Color(0xFF0F172A), Color(0xFF1E293B))
        "facebook" -> listOf(Color(0xFF2563EB), Color(0xFF3B82F6))
        "snapchat" -> listOf(Color(0xFFEAB308), Color(0xFFFBBF24))
        "reddit" -> listOf(Color(0xFFF97316), Color(0xFFEA580C))
        else -> listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
    }
    return Brush.linearGradient(
        colors = colors,
        start = Offset(0f, Float.POSITIVE_INFINITY),
        end = Offset(Float.POSITIVE_INFINITY, 0f)
    )
}

private fun getAppAbbrev(name: String): String {
    return when (name.lowercase()) {
        "instagram" -> "IG"
        "tiktok" -> "TT"
        "youtube" -> "YT"
        "x (twitter)" -> "X"
        "facebook" -> "FB"
        "snapchat" -> "SC"
        "reddit" -> "RD"
        else -> name.take(2).uppercase()
    }
}

// ── Dialogs ──

@Composable
private fun AppPickerDialog(
    blockedPackages: Set<String>,
    onSelect: (String, String) -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val pm = context.packageManager
    val socialApps = listOf(
        "com.instagram.android" to "Instagram",
        "com.zhiliaoapp.musically" to "TikTok",
        "com.google.android.youtube" to "YouTube",
        "com.twitter.android" to "X (Twitter)",
        "com.facebook.katana" to "Facebook",
        "com.snapchat.android" to "Snapchat",
        "com.reddit.frontpage" to "Reddit",
        "com.pinterest" to "Pinterest",
        "com.linkedin.android" to "LinkedIn",
        "org.telegram.messenger" to "Telegram",
    ).filter { it.first !in blockedPackages }
    val installedApps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
        .filter { (it.flags and ApplicationInfo.FLAG_SYSTEM) == 0 }
        .filter { it.packageName !in blockedPackages }
        .filter { app -> socialApps.none { it.first == app.packageName } }
        .map { it.packageName to pm.getApplicationLabel(it).toString() }
        .sortedBy { it.second }
    val allApps = socialApps + installedApps

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add App to Block", color = White, fontWeight = FontWeight.Bold) },
        text = {
            LazyColumn(modifier = Modifier.height(400.dp)) {
                items(allApps) { (pkg, name) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelect(pkg, name); onDismiss() }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(getAppIconGradient(name), RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(getAppAbbrev(name), color = White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Text(name, color = White, fontSize = 15.sp)
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Cancel", color = Gray400) } },
        containerColor = SurfaceDark
    )
}

@Composable
private fun BinanceKeyDialog(prefs: SecurePreferences, onDismiss: () -> Unit) {
    var key by remember { mutableStateOf(prefs.binanceApiKey) }
    var secret by remember { mutableStateOf(prefs.binanceApiSecret) }
    val fc = OutlinedTextFieldDefaults.colors(
        focusedTextColor = White, unfocusedTextColor = Gray400,
        focusedBorderColor = AccentBlue.copy(alpha = 0.5f), unfocusedBorderColor = SlateBorder,
        cursorColor = AccentBlue, focusedLabelColor = AccentBlue, unfocusedLabelColor = Gray500
    )
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Binance API Keys", color = White, fontWeight = FontWeight.Bold) },
        text = {
            Column {
                Text("Use read-only API keys for safety", color = Gray500, fontSize = 13.sp)
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(value = key, onValueChange = { key = it }, label = { Text("API Key") }, singleLine = true, colors = fc, shape = RoundedCornerShape(8.dp))
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = secret, onValueChange = { secret = it }, label = { Text("API Secret") }, singleLine = true, visualTransformation = PasswordVisualTransformation(), colors = fc, shape = RoundedCornerShape(8.dp))
            }
        },
        confirmButton = { TextButton(onClick = { prefs.binanceApiKey = key; prefs.binanceApiSecret = secret; onDismiss() }) { Text("Save", color = AccentBlue) } },
        dismissButton = { if (prefs.hasBinanceKeys) TextButton(onClick = { prefs.clearBinanceKeys(); onDismiss() }) { Text("Disconnect", color = StatusRed.copy(alpha = 0.7f)) } },
        containerColor = SurfaceDark
    )
}

@Composable
private fun SolanaWalletDialog(prefs: SecurePreferences, onDismiss: () -> Unit) {
    var address by remember { mutableStateOf(prefs.solanaWalletAddress) }
    val fc = OutlinedTextFieldDefaults.colors(
        focusedTextColor = White, unfocusedTextColor = Gray400,
        focusedBorderColor = AccentBlue.copy(alpha = 0.5f), unfocusedBorderColor = SlateBorder,
        cursorColor = AccentBlue, focusedLabelColor = AccentBlue, unfocusedLabelColor = Gray500
    )
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Solana Wallet", color = White, fontWeight = FontWeight.Bold) },
        text = {
            Column {
                Text("Enter your Solana wallet address", color = Gray500, fontSize = 13.sp)
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(value = address, onValueChange = { address = it }, label = { Text("Wallet Address") }, singleLine = true, colors = fc, shape = RoundedCornerShape(8.dp))
            }
        },
        confirmButton = { TextButton(onClick = { prefs.solanaWalletAddress = address; prefs.solanaWalletVerified = address.isNotBlank(); onDismiss() }) { Text("Save", color = AccentBlue) } },
        dismissButton = { if (prefs.hasSolanaWallet) TextButton(onClick = { prefs.clearSolanaWallet(); onDismiss() }) { Text("Disconnect", color = StatusRed.copy(alpha = 0.7f)) } },
        containerColor = SurfaceDark
    )
}
