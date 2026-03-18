package com.scrollingstop.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.scrollingstop.MainActivity
import com.scrollingstop.R
import com.scrollingstop.data.db.BlockedAppDao
import com.scrollingstop.data.db.DailyUsageDao
import com.scrollingstop.data.db.TradeUnlockDao
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.trade.TradeCheckManager
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@AndroidEntryPoint
class UsageMonitorService : Service() {

    companion object {
        const val CHANNEL_ID = "scrollingstop_monitor"
        const val NOTIFICATION_ID = 1
        private const val TAG = "UsageMonitor"
        private const val POLL_INTERVAL_MS = 1000L

        fun start(context: Context) {
            val intent = Intent(context, UsageMonitorService::class.java)
            context.startForegroundService(intent)
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, UsageMonitorService::class.java))
        }
    }

    @Inject lateinit var blockedAppDao: BlockedAppDao
    @Inject lateinit var dailyUsageDao: DailyUsageDao
    @Inject lateinit var tradeUnlockDao: TradeUnlockDao
    @Inject lateinit var prefs: SecurePreferences
    @Inject lateinit var tradeCheckManager: TradeCheckManager

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var monitorJob: Job? = null
    private var autoCheckJob: Job? = null
    private var lastForegroundPackage: String? = null
    private var trackingStartMs: Long = 0
    private var approachingNotifDate: LocalDate? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, buildNotification("Monitoring usage"))
        startMonitoring()
        startAutoTradeCheck()
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        monitorJob?.cancel()
        autoCheckJob?.cancel()
        scope.cancel()
        super.onDestroy()
    }

    /**
     * Auto-check trades every 5 minutes while overlay is showing.
     * If a qualifying trade is found, dismiss the overlay.
     */
    private fun startAutoTradeCheck() {
        if (autoCheckJob?.isActive == true) return

        autoCheckJob = scope.launch {
            while (true) {
                delay(5 * 60 * 1000L) // 5 minutes
                if (BlockOverlayService.isShowing.value) {
                    try {
                        val result = tradeCheckManager.checkForQualifyingTrade()
                        if (result.found) {
                            Log.d(TAG, "Auto-check found trade, dismissing overlay")
                            BlockOverlayService.dismiss(this@UsageMonitorService)
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Auto trade check failed", e)
                    }
                }
            }
        }
    }

    private fun startMonitoring() {
        if (monitorJob?.isActive == true) return

        monitorJob = scope.launch {
            // Cache blocked apps, refresh periodically
            var blockedPackages = blockedAppDao.getAllOnce().map { it.packageName }.toSet()
            var lastCacheRefresh = System.currentTimeMillis()

            while (true) {
                try {
                    // Refresh blocked apps cache every 30s
                    if (System.currentTimeMillis() - lastCacheRefresh > 30_000) {
                        blockedPackages = blockedAppDao.getAllOnce().map { it.packageName }.toSet()
                        lastCacheRefresh = System.currentTimeMillis()
                    }

                    val foreground = getForegroundPackage()
                    val today = LocalDate.now()

                    if (foreground != null && foreground in blockedPackages) {
                        // Track time on this blocked app
                        if (foreground == lastForegroundPackage) {
                            val elapsed = ((System.currentTimeMillis() - trackingStartMs) / 1000).toInt()
                            if (elapsed > 0) {
                                dailyUsageDao.ensureExists(today, foreground)
                                dailyUsageDao.incrementUsage(today, foreground, elapsed)
                                trackingStartMs = System.currentTimeMillis()
                            }
                        } else {
                            // Switched to a new blocked app
                            lastForegroundPackage = foreground
                            trackingStartMs = System.currentTimeMillis()
                        }

                        // Check if limit exceeded
                        val totalUsed = dailyUsageDao.getTotalUsageForDateOnce(today)
                        val limit = prefs.dailyLimitSeconds
                        val unlocked = tradeUnlockDao.hasUnlockForDate(today)

                        // Approaching limit notification (80%)
                        if (totalUsed >= (limit * 0.8) && totalUsed < limit && approachingNotifDate != today) {
                            approachingNotifDate = today
                            NotificationHelper.showApproachingLimit(
                                this@UsageMonitorService,
                                totalUsed / 60,
                                limit / 60
                            )
                        }

                        if (totalUsed >= limit && !unlocked) {
                            if (BlockOverlayService.isShowing.value) {
                                // Update usage in existing overlay
                                BlockOverlayService.updateUsage(
                                    this@UsageMonitorService, totalUsed
                                )
                            } else {
                                // Show block overlay
                                BlockOverlayService.show(
                                    this@UsageMonitorService, totalUsed, limit
                                )
                            }
                        }

                        // Update notification with time info
                        updateNotification(totalUsed, limit)
                    } else {
                        // Not on a blocked app
                        if (lastForegroundPackage != null) {
                            lastForegroundPackage = null
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Monitor error", e)
                }

                delay(POLL_INTERVAL_MS)
            }
        }
    }

    private fun getForegroundPackage(): String? {
        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return null

        val now = System.currentTimeMillis()
        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            now - 10_000,
            now
        )

        return stats
            ?.filter { it.lastTimeUsed > 0 }
            ?.maxByOrNull { it.lastTimeUsed }
            ?.packageName
    }

    private fun updateNotification(usedSeconds: Int, limitSeconds: Int) {
        val usedMin = usedSeconds / 60
        val limitMin = limitSeconds / 60
        val text = "Used ${usedMin}m / ${limitMin}m today"
        val notification = buildNotification(text)
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Usage Monitor",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Monitors app usage time"
            setShowBadge(false)
        }
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    private fun buildNotification(contentText: String): Notification {
        val openIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("ScrollingStop")
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setSilent(true)
            .build()
    }
}
