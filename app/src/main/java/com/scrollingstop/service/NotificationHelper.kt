package com.scrollingstop.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.scrollingstop.MainActivity
import com.scrollingstop.R

object NotificationHelper {

    const val CHANNEL_APPROACHING = "approaching_limit"
    const val CHANNEL_BRIEFING = "daily_briefing"
    const val CHANNEL_STREAK_RISK = "streak_risk"
    const val CHANNEL_WEEKLY = "weekly_summary"

    private const val NOTIF_APPROACHING = 100
    private const val NOTIF_BRIEFING = 101
    private const val NOTIF_STREAK_RISK = 102
    private const val NOTIF_WEEKLY = 103

    fun createChannels(context: Context) {
        val manager = context.getSystemService(NotificationManager::class.java)

        listOf(
            NotificationChannel(CHANNEL_APPROACHING, "Approaching Limit", NotificationManager.IMPORTANCE_HIGH)
                .apply { description = "Warns when you're near your daily limit" },
            NotificationChannel(CHANNEL_BRIEFING, "Daily Briefing", NotificationManager.IMPORTANCE_DEFAULT)
                .apply { description = "Morning summary of yesterday's usage" },
            NotificationChannel(CHANNEL_STREAK_RISK, "Streak at Risk", NotificationManager.IMPORTANCE_HIGH)
                .apply { description = "Alerts when your streak might break" },
            NotificationChannel(CHANNEL_WEEKLY, "Weekly Summary", NotificationManager.IMPORTANCE_DEFAULT)
                .apply { description = "Sunday evening usage recap" }
        ).forEach { manager.createNotificationChannel(it) }
    }

    fun showApproachingLimit(context: Context, usedMinutes: Int, limitMinutes: Int) {
        show(
            context,
            CHANNEL_APPROACHING,
            NOTIF_APPROACHING,
            "Almost at your limit!",
            "You've used ${usedMinutes}m of your ${limitMinutes}m daily limit. Time to wrap up."
        )
    }

    fun showMorningBriefing(context: Context, usedMinutes: Int, streakDays: Int) {
        val streakText = if (streakDays > 0) " | $streakDays-day streak" else ""
        show(
            context,
            CHANNEL_BRIEFING,
            NOTIF_BRIEFING,
            "Yesterday's Summary",
            "You scrolled for ${usedMinutes}m yesterday$streakText"
        )
    }

    fun showStreakAtRisk(context: Context, streakDays: Int) {
        show(
            context,
            CHANNEL_STREAK_RISK,
            NOTIF_STREAK_RISK,
            "Your ${streakDays}-day streak is at risk!",
            "No trade unlock today. Make a trade before midnight to keep your streak."
        )
    }

    fun showWeeklySummary(context: Context, totalMinutes: Int, tradeUnlocks: Int, bypasses: Int) {
        show(
            context,
            CHANNEL_WEEKLY,
            NOTIF_WEEKLY,
            "Weekly Recap",
            "This week: ${totalMinutes}m screen time | $tradeUnlocks trade unlocks | $bypasses bypasses"
        )
    }

    private fun show(context: Context, channelId: String, notifId: Int, title: String, text: String) {
        val intent = Intent(context, MainActivity::class.java)
        val pending = PendingIntent.getActivity(
            context, notifId, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pending)
            .setAutoCancel(true)
            .build()

        val manager = context.getSystemService(NotificationManager::class.java)
        manager.notify(notifId, notification)
    }
}
