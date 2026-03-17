package com.scrollingstop

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.service.UsageMonitorService
import com.scrollingstop.trade.solana.PhantomWalletConnector
import com.scrollingstop.ui.navigation.AppNavigation
import com.scrollingstop.ui.theme.ScrollingStopTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var prefs: SecurePreferences
    @Inject lateinit var phantomConnector: PhantomWalletConnector

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Handle Phantom deep link callback on launch
        intent?.data?.let { handleDeepLink(it) }

        setContent {
            ScrollingStopTheme {
                AppNavigation(prefs = prefs)
            }
        }

        // Start monitoring service if onboarding completed
        if (prefs.onboardingCompleted) {
            UsageMonitorService.start(this)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        intent.data?.let { handleDeepLink(it) }
    }

    private fun handleDeepLink(uri: android.net.Uri) {
        if (uri.scheme == PhantomWalletConnector.REDIRECT_SCHEME &&
            uri.host == PhantomWalletConnector.REDIRECT_HOST
        ) {
            val success = phantomConnector.handleConnectCallback(uri)
            Log.d("MainActivity", "Phantom callback handled: $success")
        }
    }
}
