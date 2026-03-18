package com.scrollingstop.service

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.scrollingstop.data.db.TradeUnlockDao
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import java.time.LocalDate

@HiltWorker
class StreakRiskWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val tradeUnlockDao: TradeUnlockDao
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val today = LocalDate.now()
        val hasUnlockToday = tradeUnlockDao.hasUnlockForDate(today)

        if (!hasUnlockToday) {
            // Calculate current streak
            var streak = 0
            var day = today.minusDays(1)
            while (tradeUnlockDao.hasUnlockForDate(day)) {
                streak++
                day = day.minusDays(1)
            }

            if (streak > 0) {
                NotificationHelper.showStreakAtRisk(applicationContext, streak)
            }
        }
        return Result.success()
    }
}
