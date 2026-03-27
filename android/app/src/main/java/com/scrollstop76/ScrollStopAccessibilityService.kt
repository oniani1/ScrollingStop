package com.scrollstop76

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import java.util.Calendar

class ScrollStopAccessibilityService : AccessibilityService() {

    private var lastCheckedPackage: String? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
            notificationTimeout = 300
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return

        // Don't re-check the same package consecutively
        if (packageName == lastCheckedPackage) return
        lastCheckedPackage = packageName

        // Skip system UI and our own app
        if (packageName == this.packageName ||
            packageName == "com.android.systemui" ||
            packageName == "com.android.launcher" ||
            packageName.startsWith("com.android.launcher")) {
            return
        }

        val prefs = getSharedPreferences(AppBlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
        val blockedApps = prefs.getStringSet(AppBlockerModule.KEY_BLOCKED_APPS, emptySet()) ?: emptySet()
        val isUnlocked = prefs.getBoolean(AppBlockerModule.KEY_UNLOCKED_TODAY, false)

        // Only block if the app is in blocked list and user hasn't unlocked today
        if (!blockedApps.contains(packageName) || isUnlocked) return

        // Check if user has exceeded daily limit
        if (hasExceededDailyLimit()) {
            showBlockOverlay(packageName)
        }
    }

    private fun hasExceededDailyLimit(): Boolean {
        return try {
            val prefs = getSharedPreferences(AppBlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
            val dailyLimitMinutes = prefs.getInt("daily_limit_minutes", 60)
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

            totalMinutes >= dailyLimitMinutes
        } catch (e: Exception) {
            false
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
        lastCheckedPackage = null
    }

    override fun onDestroy() {
        super.onDestroy()
        lastCheckedPackage = null
    }
}
