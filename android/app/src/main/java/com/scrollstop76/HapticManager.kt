package com.scrollstop76

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

class HapticManager(private val context: Context) {

    private var lastVibrateTime: Long = 0

    @Suppress("DEPRECATION")
    fun checkAndVibrate(currentUsageMinutes: Long) {
        val prefs = context.getSharedPreferences(AppBlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
        val hapticEnabled = prefs.getBoolean("haptic_enabled", true)
        if (!hapticEnabled) return

        val dailyLimitMinutes = prefs.getInt("daily_limit_minutes", 60)
        if (dailyLimitMinutes <= 0) return

        val ratio = currentUsageMinutes.toFloat() / dailyLimitMinutes.toFloat()
        if (ratio < 0.70f) return

        val now = System.currentTimeMillis()

        // Determine pattern and rate limit based on threshold
        val (pattern, minGapMs) = when {
            ratio >= 0.95f -> longArrayOf(0, 150, 80, 150, 80, 150) to 10_000L
            ratio >= 0.85f -> longArrayOf(0, 100, 80, 100) to 30_000L
            else -> longArrayOf(0, 50) to 60_000L
        }

        if (now - lastVibrateTime < minGapMs) return
        lastVibrateTime = now

        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vm.defaultVibrator
        } else {
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
        } else {
            vibrator.vibrate(pattern, -1)
        }
    }
}
