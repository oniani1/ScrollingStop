package com.scrollingstop.service

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.scrollingstop.data.db.DailyUsageDao
import com.scrollingstop.data.db.TradeUnlockDao
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import java.time.LocalDate

@HiltWorker
class DailyBriefingWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val dailyUsageDao: DailyUsageDao,
    private val tradeUnlockDao: TradeUnlockDao
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val yesterday = LocalDate.now().minusDays(1)
        val usedSeconds = dailyUsageDao.getTotalUsageForDateOnce(yesterday)
        val usedMinutes = usedSeconds / 60

        // Calculate streak
        var streak = 0
        var day = yesterday
        while (tradeUnlockDao.hasUnlockForDate(day)) {
            streak++
            day = day.minusDays(1)
        }

        NotificationHelper.showMorningBriefing(applicationContext, usedMinutes, streak)
        return Result.success()
    }
}
