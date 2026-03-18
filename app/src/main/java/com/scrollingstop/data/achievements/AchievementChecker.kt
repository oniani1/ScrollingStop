package com.scrollingstop.data.achievements

import com.scrollingstop.data.db.AchievementDao
import com.scrollingstop.data.db.BypassLogDao
import com.scrollingstop.data.db.DailyUsageDao
import com.scrollingstop.data.db.TradeUnlockDao
import com.scrollingstop.data.model.Achievement
import com.scrollingstop.data.preferences.SecurePreferences
import java.time.Instant
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AchievementChecker @Inject constructor(
    private val achievementDao: AchievementDao,
    private val tradeUnlockDao: TradeUnlockDao,
    private val bypassLogDao: BypassLogDao,
    private val dailyUsageDao: DailyUsageDao,
    private val prefs: SecurePreferences
) {
    suspend fun checkAll(currentStreak: Int) {
        // Ensure all achievement rows exist
        for (def in AchievementDef.entries) {
            achievementDao.insertIfAbsent(Achievement(id = def.id))
        }

        checkAchievement(AchievementDef.FIRST_TRADE) {
            tradeUnlockDao.getTotalTradeCount() >= 1
        }
        checkAchievement(AchievementDef.STREAK_7) {
            currentStreak >= 7
        }
        checkAchievement(AchievementDef.STREAK_30) {
            currentStreak >= 30
        }
        checkAchievement(AchievementDef.PROFIT_1K) {
            tradeUnlockDao.getTotalProfit() >= 1000.0
        }
        checkAchievement(AchievementDef.ZERO_BYPASS_WEEK) {
            val today = LocalDate.now()
            val weekAgo = today.minusDays(6)
            bypassLogDao.getBypassCountForRange(weekAgo, today) == 0 &&
                    tradeUnlockDao.getTradeUnlockCount(weekAgo, today) >= 7
        }
        checkAchievement(AchievementDef.UNDER_30) {
            val today = LocalDate.now()
            (0 until 7).all { offset ->
                val day = today.minusDays(offset.toLong())
                dailyUsageDao.getTotalUsageForDateOnce(day) < 1800
            }
        }
        checkAchievement(AchievementDef.SOLANA_DEGEN) {
            tradeUnlockDao.getAllUnlocks().any { it.source.contains("solana", ignoreCase = true) }
        }
        checkAchievement(AchievementDef.DIAMOND_HANDS) {
            val unlocks = tradeUnlockDao.getAllUnlocks().sortedBy { it.date }
            if (unlocks.size < 50) return@checkAchievement false
            // Check 50+ consecutive days with trades and 0 bypasses in that range
            val dates = unlocks.map { it.date }.distinct().sorted()
            var consecutiveCount = 1
            var maxConsecutive = 1
            var streakStart = dates.first()
            for (i in 1 until dates.size) {
                if (dates[i] == dates[i - 1].plusDays(1)) {
                    consecutiveCount++
                    if (consecutiveCount > maxConsecutive) {
                        maxConsecutive = consecutiveCount
                    }
                } else {
                    if (consecutiveCount >= 50) {
                        val streakEnd = dates[i - 1]
                        if (bypassLogDao.getBypassCountForRange(streakStart, streakEnd) == 0) {
                            return@checkAchievement true
                        }
                    }
                    consecutiveCount = 1
                    streakStart = dates[i]
                }
            }
            if (consecutiveCount >= 50) {
                bypassLogDao.getBypassCountForRange(streakStart, dates.last()) == 0
            } else false
        }
    }

    private suspend fun checkAchievement(def: AchievementDef, condition: suspend () -> Boolean) {
        if (achievementDao.isUnlocked(def.id)) return
        if (condition()) {
            achievementDao.unlock(def.id, Instant.now())
        }
    }
}
