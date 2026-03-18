package com.scrollingstop.ui.settings

import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.scrollingstop.data.model.BlockedApp
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.ui.theme.AccentOrange
import com.scrollingstop.ui.theme.DeepBlack
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
import com.scrollingstop.ui.theme.SurfaceDark

@OptIn(ExperimentalMaterial3Api::class)
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

    var limitMinutes by remember { mutableFloatStateOf(prefs.dailyLimitSeconds / 60f) }
    var profitThreshold by remember { mutableFloatStateOf(prefs.profitThresholdUsd) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings", color = Gray100, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Gray300)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DeepBlack)
            )
        },
        containerColor = DeepBlack
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Blocked Apps section
            item {
                SectionHeader("BLOCKED APPS")
            }

            item {
                GlassSection {
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        blockedApps.forEachIndexed { index, app ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 10.dp, horizontal = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(app.displayName, color = Gray100, fontSize = 15.sp)
                                IconButton(
                                    onClick = { viewModel.removeApp(app.packageName) },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Default.Delete, "Remove", tint = StatusRed.copy(alpha = 0.6f), modifier = Modifier.size(18.dp))
                                }
                            }
                            if (index < blockedApps.lastIndex) {
                                Box(
                                    Modifier
                                        .fillMaxWidth()
                                        .height(1.dp)
                                        .background(GlassBorder)
                                )
                            }
                        }

                        if (blockedApps.isEmpty()) {
                            Text("No apps blocked yet", color = Gray600, fontSize = 14.sp, modifier = Modifier.padding(vertical = 8.dp))
                        }
                    }
                }
            }

            item {
                Button(
                    onClick = { showAppPicker = true },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GlassBg,
                        contentColor = AccentOrange
                    ),
                    shape = RoundedCornerShape(12.dp),
                    border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                        brush = Brush.linearGradient(listOf(AccentOrange.copy(alpha = 0.3f), AccentOrange.copy(alpha = 0.3f)))
                    )
                ) {
                    Icon(Icons.Default.Add, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Add App", fontWeight = FontWeight.Medium)
                }
            }

            // Limits section
            item {
                Spacer(Modifier.height(8.dp))
                SectionHeader("LIMITS")
            }

            item {
                GlassSection {
                    Column {
                        Text("Daily Limit", color = Gray400, fontSize = 13.sp)
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "${limitMinutes.toInt()} minutes",
                            color = Gray100,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Slider(
                            value = limitMinutes,
                            onValueChange = { limitMinutes = it },
                            onValueChangeFinished = { prefs.dailyLimitSeconds = (limitMinutes * 60).toInt() },
                            valueRange = 5f..180f,
                            steps = 34,
                            modifier = Modifier.fillMaxWidth(),
                            colors = SliderDefaults.colors(
                                thumbColor = AccentOrange,
                                activeTrackColor = AccentOrange,
                                inactiveTrackColor = GlassBorder
                            )
                        )

                        Spacer(Modifier.height(16.dp))

                        Text("Profit Threshold", color = Gray400, fontSize = 13.sp)
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "$${profitThreshold.toInt()}",
                            color = Gray100,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Slider(
                            value = profitThreshold,
                            onValueChange = { profitThreshold = it },
                            onValueChangeFinished = { prefs.profitThresholdUsd = profitThreshold },
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
            }

            // Trading Connections
            item {
                Spacer(Modifier.height(8.dp))
                SectionHeader("TRADING CONNECTIONS")
            }

            item {
                GlassSection {
                    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        // Binance
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Binance API", color = Gray100, fontSize = 15.sp, fontWeight = FontWeight.Medium)
                                Spacer(Modifier.height(4.dp))
                                ConnectionBadge(prefs.hasBinanceKeys)
                            }
                            Button(
                                onClick = { showBinanceDialog = true },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = GlassBg,
                                    contentColor = AccentOrange
                                ),
                                shape = RoundedCornerShape(8.dp),
                                border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                                    brush = Brush.linearGradient(listOf(GlassBorderLight, GlassBorderLight))
                                )
                            ) {
                                Text(
                                    if (prefs.hasBinanceKeys) "Update" else "Connect",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }

                        Box(Modifier.fillMaxWidth().height(1.dp).background(GlassBorder))

                        // Solana
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Solana Wallet", color = Gray100, fontSize = 15.sp, fontWeight = FontWeight.Medium)
                                Spacer(Modifier.height(4.dp))
                                val addr = prefs.solanaWalletAddress
                                if (addr.isNotBlank()) {
                                    ConnectionBadge(true, "${addr.take(6)}...${addr.takeLast(4)}")
                                } else {
                                    ConnectionBadge(false)
                                }
                            }
                            Button(
                                onClick = { showSolanaDialog = true },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = GlassBg,
                                    contentColor = AccentOrange
                                ),
                                shape = RoundedCornerShape(8.dp),
                                border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(
                                    brush = Brush.linearGradient(listOf(GlassBorderLight, GlassBorderLight))
                                )
                            ) {
                                Text(
                                    if (prefs.hasSolanaWallet) "Update" else "Connect",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }

            item { Spacer(Modifier.height(32.dp)) }
        }
    }

    // App picker dialog
    if (showAppPicker) {
        AppPickerDialog(
            blockedPackages = blockedApps.map { it.packageName }.toSet(),
            onSelect = { pkg, name -> viewModel.addApp(pkg, name) },
            onDismiss = { showAppPicker = false }
        )
    }

    // Binance dialog
    if (showBinanceDialog) {
        BinanceKeyDialog(
            prefs = prefs,
            onDismiss = { showBinanceDialog = false }
        )
    }

    // Solana dialog
    if (showSolanaDialog) {
        SolanaWalletDialog(
            prefs = prefs,
            onDismiss = { showSolanaDialog = false }
        )
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        title,
        color = Gray600,
        fontSize = 11.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 1.sp,
        modifier = Modifier.padding(bottom = 4.dp, top = 4.dp)
    )
}

@Composable
private fun GlassSection(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(GlassBg, RoundedCornerShape(16.dp))
            .border(1.dp, GlassBorder, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        content()
    }
}

@Composable
private fun ConnectionBadge(connected: Boolean, label: String? = null) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(if (connected) StatusGreen else StatusRed.copy(alpha = 0.5f), CircleShape)
        )
        Spacer(Modifier.width(6.dp))
        Text(
            label ?: if (connected) "Connected" else "Not connected",
            color = if (connected) StatusGreen else Gray600,
            fontSize = 12.sp
        )
    }
}

@Composable
private fun AppPickerDialog(
    blockedPackages: Set<String>,
    onSelect: (String, String) -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val pm = context.packageManager

    // Common social media packages
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

    // Also get installed apps that aren't in the predefined list
    val installedApps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
        .filter { (it.flags and ApplicationInfo.FLAG_SYSTEM) == 0 }
        .filter { it.packageName !in blockedPackages }
        .filter { app -> socialApps.none { it.first == app.packageName } }
        .map { it.packageName to pm.getApplicationLabel(it).toString() }
        .sortedBy { it.second }

    val allApps = socialApps + installedApps

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add App to Block", color = Gray100, fontWeight = FontWeight.Bold) },
        text = {
            LazyColumn(modifier = Modifier.height(400.dp)) {
                items(allApps) { (pkg, name) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                onSelect(pkg, name)
                                onDismiss()
                            }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(name, color = Gray100, fontSize = 15.sp)
                        Spacer(Modifier.weight(1f))
                        Text(pkg.take(30), color = Gray600, fontSize = 11.sp)
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Cancel", color = Gray400) }
        },
        containerColor = SurfaceDark
    )
}

@Composable
private fun BinanceKeyDialog(prefs: SecurePreferences, onDismiss: () -> Unit) {
    var key by remember { mutableStateOf(prefs.binanceApiKey) }
    var secret by remember { mutableStateOf(prefs.binanceApiSecret) }

    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedTextColor = Gray100,
        unfocusedTextColor = Gray300,
        focusedBorderColor = AccentOrange.copy(alpha = 0.5f),
        unfocusedBorderColor = GlassBorder,
        cursorColor = AccentOrange,
        focusedLabelColor = AccentOrange,
        unfocusedLabelColor = Gray600
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Binance API Keys", color = Gray100, fontWeight = FontWeight.Bold) },
        text = {
            Column {
                Text("Use read-only API keys for safety", color = Gray600, fontSize = 13.sp)
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = key,
                    onValueChange = { key = it },
                    label = { Text("API Key") },
                    singleLine = true,
                    colors = fieldColors,
                    shape = RoundedCornerShape(8.dp)
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = secret,
                    onValueChange = { secret = it },
                    label = { Text("API Secret") },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    colors = fieldColors,
                    shape = RoundedCornerShape(8.dp)
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                prefs.binanceApiKey = key
                prefs.binanceApiSecret = secret
                onDismiss()
            }) { Text("Save", color = AccentOrange) }
        },
        dismissButton = {
            if (prefs.hasBinanceKeys) {
                TextButton(onClick = {
                    prefs.clearBinanceKeys()
                    onDismiss()
                }) { Text("Disconnect", color = StatusRed.copy(alpha = 0.7f)) }
            }
        },
        containerColor = SurfaceDark
    )
}

@Composable
private fun SolanaWalletDialog(prefs: SecurePreferences, onDismiss: () -> Unit) {
    var address by remember { mutableStateOf(prefs.solanaWalletAddress) }

    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedTextColor = Gray100,
        unfocusedTextColor = Gray300,
        focusedBorderColor = AccentOrange.copy(alpha = 0.5f),
        unfocusedBorderColor = GlassBorder,
        cursorColor = AccentOrange,
        focusedLabelColor = AccentOrange,
        unfocusedLabelColor = Gray600
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Solana Wallet", color = Gray100, fontWeight = FontWeight.Bold) },
        text = {
            Column {
                Text("Enter your Solana wallet address", color = Gray600, fontSize = 13.sp)
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { Text("Wallet Address") },
                    singleLine = true,
                    colors = fieldColors,
                    shape = RoundedCornerShape(8.dp)
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                prefs.solanaWalletAddress = address
                prefs.solanaWalletVerified = address.isNotBlank()
                onDismiss()
            }) { Text("Save", color = AccentOrange) }
        },
        dismissButton = {
            if (prefs.hasSolanaWallet) {
                TextButton(onClick = {
                    prefs.clearSolanaWallet()
                    onDismiss()
                }) { Text("Disconnect", color = StatusRed.copy(alpha = 0.7f)) }
            }
        },
        containerColor = SurfaceDark
    )
}
