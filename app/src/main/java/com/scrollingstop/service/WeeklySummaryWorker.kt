package com.scrollingstop.service

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.scrollingstop.data.db.BypassLogDao
import com.scrollingstop.data.db.DailyUsageDao
import com.scrollingstop.data.db.TradeUnlockDao
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.TemporalAdjusters

@HiltWorker
class WeeklySummaryWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val dailyUsageDao: DailyUsageDao,
    private val tradeUnlockDao: TradeUnlockDao,
    private val bypassLogDao: BypassLogDao
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val today = LocalDate.now()
        val weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))

        val weekUsage = dailyUsageDao.getUsageForDateRange(weekStart, today)
        val totalMinutes = weekUsage.sumOf { it.usedSeconds } / 60
        val tradeUnlocks = tradeUnlockDao.getTradeUnlockCount(weekStart, today)
        val bypasses = bypassLogDao.getBypassCountForRange(weekStart, today)

        NotificationHelper.showWeeklySummary(applicationContext, totalMinutes, tradeUnlocks, bypasses)
        return Result.success()
    }
}
