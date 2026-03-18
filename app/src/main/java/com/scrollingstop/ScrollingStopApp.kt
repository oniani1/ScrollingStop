package com.scrollingstop

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.scrollingstop.service.DailyBriefingWorker
import com.scrollingstop.service.NotificationHelper
import com.scrollingstop.service.StreakRiskWorker
import com.scrollingstop.service.WeeklySummaryWorker
import dagger.hilt.android.HiltAndroidApp
import java.time.Duration
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.concurrent.TimeUnit
import javax.inject.Inject

@HiltAndroidApp
class ScrollingStopApp : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        NotificationHelper.createChannels(this)
        scheduleWorkers()
    }

    private fun scheduleWorkers() {
        val workManager = WorkManager.getInstance(this)

        // Daily Briefing — every 24h, targeting ~8am
        val briefingDelay = delayUntilHour(8)
        val briefingRequest = PeriodicWorkRequestBuilder<DailyBriefingWorker>(24, TimeUnit.HOURS)
            .setInitialDelay(briefingDelay, TimeUnit.MILLISECONDS)
            .build()
        workManager.enqueueUniquePeriodicWork(
            "daily_briefing",
            ExistingPeriodicWorkPolicy.KEEP,
            briefingRequest
        )

        // Streak at Risk — every 24h, targeting ~9pm
        val streakDelay = delayUntilHour(21)
        val streakRequest = PeriodicWorkRequestBuilder<StreakRiskWorker>(24, TimeUnit.HOURS)
            .setInitialDelay(streakDelay, TimeUnit.MILLISECONDS)
            .build()
        workManager.enqueueUniquePeriodicWork(
            "streak_risk",
            ExistingPeriodicWorkPolicy.KEEP,
            streakRequest
        )

        // Weekly Summary — every 7 days, targeting Sunday 7pm
        val weeklyDelay = delayUntilDayAndHour(java.time.DayOfWeek.SUNDAY, 19)
        val weeklyRequest = PeriodicWorkRequestBuilder<WeeklySummaryWorker>(7, TimeUnit.DAYS)
            .setInitialDelay(weeklyDelay, TimeUnit.MILLISECONDS)
            .build()
        workManager.enqueueUniquePeriodicWork(
            "weekly_summary",
            ExistingPeriodicWorkPolicy.KEEP,
            weeklyRequest
        )
    }

    private fun delayUntilHour(hour: Int): Long {
        val now = LocalDateTime.now()
        var target = now.toLocalDate().atTime(LocalTime.of(hour, 0))
        if (now >= target) {
            target = target.plusDays(1)
        }
        return Duration.between(now, target).toMillis()
    }

    private fun delayUntilDayAndHour(day: java.time.DayOfWeek, hour: Int): Long {
        val now = LocalDateTime.now()
        var target = now.toLocalDate()
            .with(java.time.temporal.TemporalAdjusters.nextOrSame(day))
            .atTime(LocalTime.of(hour, 0))
        if (now >= target) {
            target = target.plusWeeks(1)
        }
        return Duration.between(now, target).toMillis()
    }
}
