package com.scrollingstop.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.KeyEvent
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.scrollingstop.data.db.BypassLogDao
import com.scrollingstop.data.db.DailyUsageDao
import com.scrollingstop.data.db.TradeUnlockDao
import com.scrollingstop.data.model.BypassLog
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.trade.TradeCheckManager
import com.scrollingstop.ui.overlay.BlockOverlayContent
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import javax.inject.Inject

@AndroidEntryPoint
class BlockOverlayService : Service(), LifecycleOwner, SavedStateRegistryOwner {

    companion object {
        private const val TAG = "BlockOverlay"
        private val _isShowing = MutableStateFlow(false)
        val isShowing = _isShowing.asStateFlow()

        const val EXTRA_USED_SECONDS = "used_seconds"
        const val EXTRA_LIMIT_SECONDS = "limit_seconds"

        fun show(context: Context, usedSeconds: Int = 0, limitSeconds: Int = 3600) {
            if (_isShowing.value) return
            if (!Settings.canDrawOverlays(context)) {
                Log.w(TAG, "No overlay permission")
                return
            }
            val intent = Intent(context, BlockOverlayService::class.java).apply {
                putExtra(EXTRA_USED_SECONDS, usedSeconds)
                putExtra(EXTRA_LIMIT_SECONDS, limitSeconds)
            }
            context.startService(intent)
        }

        fun dismiss(context: Context) {
            context.stopService(Intent(context, BlockOverlayService::class.java))
        }

        fun updateUsage(context: Context, usedSeconds: Int) {
            val intent = Intent(context, BlockOverlayService::class.java).apply {
                putExtra(EXTRA_USED_SECONDS, usedSeconds)
                action = "UPDATE_USAGE"
            }
            context.startService(intent)
        }
    }

    @Inject lateinit var prefs: SecurePreferences
    @Inject lateinit var dailyUsageDao: DailyUsageDao
    @Inject lateinit var tradeUnlockDao: TradeUnlockDao
    @Inject lateinit var bypassLogDao: BypassLogDao
    @Inject lateinit var tradeCheckManager: TradeCheckManager

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var overlayContainer: FrameLayout? = null
    private val lifecycleRegistry = LifecycleRegistry(this)
    private val savedStateRegistryController = SavedStateRegistryController.create(this)

    // Reactive state for the overlay UI
    private val usedSecondsState = mutableIntStateOf(0)
    private val limitSecondsState = mutableIntStateOf(3600)
    private val streakDaysState = mutableIntStateOf(0)
    private val checkingTradeState = mutableStateOf(false)
    private val tradeCheckResultState = mutableStateOf<String?>(null)

    override val lifecycle: Lifecycle get() = lifecycleRegistry
    override val savedStateRegistry: SavedStateRegistry
        get() = savedStateRegistryController.savedStateRegistry

    override fun onCreate() {
        super.onCreate()
        savedStateRegistryController.performRestore(null)
        lifecycleRegistry.currentState = Lifecycle.State.CREATED
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val used = intent?.getIntExtra(EXTRA_USED_SECONDS, 0) ?: 0
        val limit = intent?.getIntExtra(EXTRA_LIMIT_SECONDS, prefs.dailyLimitSeconds) ?: prefs.dailyLimitSeconds

        if (intent?.action == "UPDATE_USAGE") {
            usedSecondsState.intValue = used
            return START_NOT_STICKY
        }

        usedSecondsState.intValue = used
        limitSecondsState.intValue = limit
        loadStreak()
        showOverlay()
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        removeOverlay()
        lifecycleRegistry.currentState = Lifecycle.State.DESTROYED
        scope.cancel()
        super.onDestroy()
    }

    private fun loadStreak() {
        scope.launch(Dispatchers.IO) {
            val today = LocalDate.now()
            var streak = 0
            var day = today.minusDays(1) // start from yesterday
            while (true) {
                val hadTrade = tradeUnlockDao.hasUnlockForDate(day)
                if (hadTrade) {
                    streak++
                    day = day.minusDays(1)
                } else {
                    break
                }
            }
            // Include today if already unlocked
            if (tradeUnlockDao.hasUnlockForDate(today)) streak++
            streakDaysState.intValue = streak
        }
    }

    private fun showOverlay() {
        if (overlayContainer != null) return

        val windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            // Focusable to capture keys and allow text input
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                    or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
        }

        // FrameLayout wrapper to intercept back/home/recents keys
        val container = object : FrameLayout(this) {
            override fun dispatchKeyEvent(event: KeyEvent): Boolean {
                if (event.keyCode == KeyEvent.KEYCODE_BACK ||
                    event.keyCode == KeyEvent.KEYCODE_HOME ||
                    event.keyCode == KeyEvent.KEYCODE_APP_SWITCH
                ) {
                    return true // consume — overlay can't be dismissed
                }
                return super.dispatchKeyEvent(event)
            }
        }

        val composeView = ComposeView(this).apply {
            setViewTreeLifecycleOwner(this@BlockOverlayService)
            setViewTreeSavedStateRegistryOwner(this@BlockOverlayService)
            setContent {
                BlockOverlayContent(
                    usedSeconds = usedSecondsState.intValue,
                    limitSeconds = limitSecondsState.intValue,
                    streakDays = streakDaysState.intValue,
                    isCheckingTrade = checkingTradeState.value,
                    tradeCheckResult = tradeCheckResultState.value,
                    onBypassConfirmed = { handleBypass() },
                    onTradeCheckRequested = { handleTradeCheck() },
                    onOpenBinance = { openApp("com.binance.dev") },
                    onOpenPhantom = { openApp("app.phantom") },
                    bypassPhrase = prefs.bypassPhrase,
                    hasBinance = prefs.hasBinanceKeys,
                    hasSolana = prefs.hasSolanaWallet
                )
            }
        }

        container.addView(
            composeView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        )

        try {
            windowManager.addView(container, params)
            overlayContainer = container
            lifecycleRegistry.currentState = Lifecycle.State.RESUMED
            _isShowing.value = true
            Log.d(TAG, "Overlay shown")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to show overlay", e)
        }
    }

    private fun removeOverlay() {
        overlayContainer?.let {
            try {
                val windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
                windowManager.removeView(it)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to remove overlay", e)
            }
        }
        overlayContainer = null
        _isShowing.value = false
    }

    private fun handleBypass() {
        scope.launch {
            val today = LocalDate.now()
            bypassLogDao.insert(BypassLog(date = today, bypassedAt = Instant.now()))
            dismiss(this@BlockOverlayService)
        }
    }

    private fun handleTradeCheck() {
        if (checkingTradeState.value) return

        checkingTradeState.value = true
        tradeCheckResultState.value = null

        scope.launch(Dispatchers.IO) {
            try {
                val result = tradeCheckManager.checkForQualifyingTrade()
                if (result.found) {
                    val profitStr = "$${String.format("%.2f", result.profitUsd)}"
                    tradeCheckResultState.value = "Trade found ($profitStr)! Unlocking..."
                    delay(1500)
                    dismiss(this@BlockOverlayService)
                } else {
                    tradeCheckResultState.value = result.details.ifEmpty {
                        "No qualifying trade found yet"
                    }
                }
            } catch (e: Exception) {
                tradeCheckResultState.value = "Check failed — try again"
                Log.e(TAG, "Trade check failed", e)
            } finally {
                checkingTradeState.value = false
            }
        }
    }

    private fun openApp(packageName: String) {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(launchIntent)
        }
    }
}
