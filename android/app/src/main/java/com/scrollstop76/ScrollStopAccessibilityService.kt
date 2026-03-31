package com.scrollstop76

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import java.util.Calendar

class ScrollStopAccessibilityService : AccessibilityService() {

    private var currentForegroundPackage: String? = null
    private var hapticManager: HapticManager? = null
    private val handler = Handler(Looper.getMainLooper())
    private var checkRunnable: Runnable? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        hapticManager = HapticManager(this)
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
            notificationTimeout = 300
        }
        startPeriodicCheck()
    }

    private fun startPeriodicCheck() {
        checkRunnable = object : Runnable {
            override fun run() {
                val pkg = currentForegroundPackage
                if (pkg != null && pkg != packageName) {
                    checkAndBlock(pkg)
                }
                handler.postDelayed(this, 10_000)
            }
        }
        handler.postDelayed(checkRunnable!!, 10_000)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return

        // Skip system UI and our own app
        if (packageName == this.packageName ||
            packageName == "com.android.systemui" ||
            packageName.startsWith("com.android.launcher")) {
            currentForegroundPackage = null
            return
        }

        currentForegroundPackage = packageName
        checkAndBlock(packageName)
    }

    private fun checkAndBlock(packageName: String) {
        val prefs = getSharedPreferences(AppBlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
        val blockedApps = prefs.getStringSet(AppBlockerModule.KEY_BLOCKED_APPS, emptySet()) ?: emptySet()
        val isUnlocked = prefs.getBoolean(AppBlockerModule.KEY_UNLOCKED_TODAY, false)

        if (!blockedApps.contains(packageName) || isUnlocked) return

        val usageMinutes = getTodayUsageMinutes()

        hapticManager?.checkAndVibrate(usageMinutes)

        val dailyLimitMinutes = prefs.getInt("daily_limit_minutes", 60)

        if (usageMinutes >= dailyLimitMinutes) {
            showBlockOverlay(packageName)
        }
    }

    private fun getTodayUsageMinutes(): Long {
        return try {
            val prefs = getSharedPreferences(AppBlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
            val blockedApps = prefs.getStringSet(AppBlockerModule.KEY_BLOCKED_APPS, emptySet()) ?: emptySet()

            val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                calendar.timeInMillis,
                System.currentTimeMillis()
            )

            var totalMinutes = 0L
            stats?.forEach { stat ->
                if (blockedApps.contains(stat.packageName)) {
                    totalMinutes += stat.totalTimeInForeground / 60_000
                }
            }

            totalMinutes
        } catch (e: Exception) {
            0L
        }
    }

    private fun showBlockOverlay(blockedPackage: String) {
        if (!Settings.canDrawOverlays(this)) return

        val intent = Intent(this, BlockOverlayService::class.java).apply {
            putExtra("blocked_package", blockedPackage)
        }
        startService(intent)
    }

    override fun onInterrupt() {
        currentForegroundPackage = null
    }

    override fun onDestroy() {
        super.onDestroy()
        checkRunnable?.let { handler.removeCallbacks(it) }
        currentForegroundPackage = null
    }
}
