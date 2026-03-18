package com.scrollingstop.ui.stats

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.scrollingstop.data.achievements.AchievementChecker
import com.scrollingstop.data.achievements.AchievementDef
import com.scrollingstop.data.db.AchievementDao
import com.scrollingstop.data.db.BypassLogDao
import com.scrollingstop.data.db.DailyUsageDao
import com.scrollingstop.data.db.TradeUnlockDao
import com.scrollingstop.data.model.Achievement
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.TemporalAdjusters
import javax.inject.Inject

data class AppUsageStat(
    val packageName: String,
    val usedSeconds: Int
)

data class StatsState(
    val isLoading: Boolean = true,
    // Time this week
    val weekTotalSeconds: Int = 0,
    val weekDailyAvgSeconds: Int = 0,
    // vs last week
    val lastWeekTotalSeconds: Int = 0,
    // Per-app breakdown (this week)
    val perAppUsage: List<AppUsageStat> = emptyList(),
    // Trading performance
    val totalProfit: Double = 0.0,
    val totalTradeCount: Int = 0,
    val bestTrade: Double = 0.0,
    // Bypass history
    val bypassesThisWeek: Int = 0,
    val bypassesLastWeek: Int = 0,
    val bypassesAllTime: Int = 0,
    // Achievements
    val achievements: List<AchievementDisplay> = emptyList()
)

data class AchievementDisplay(
    val def: AchievementDef,
    val achievement: Achievement
)

@HiltViewModel
class StatsViewModel @Inject constructor(
    private val dailyUsageDao: DailyUsageDao,
    private val tradeUnlockDao: TradeUnlockDao,
    private val bypassLogDao: BypassLogDao,
    private val achievementDao: AchievementDao,
    private val achievementChecker: AchievementChecker
) : ViewModel() {

    private val _state = MutableStateFlow(StatsState())
    val state: StateFlow<StatsState> = _state.asStateFlow()

    init {
        loadStats()
    }

    fun loadStats() {
        viewModelScope.launch {
            val today = LocalDate.now()
            val weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
            val weekEnd = today
            val lastWeekStart = weekStart.minusDays(7)
            val lastWeekEnd = weekStart.minusDays(1)

            // This week usage
            val thisWeekUsage = dailyUsageDao.getUsageForDateRange(weekStart, weekEnd)
            val weekTotal = thisWeekUsage.sumOf { it.usedSeconds }
            val daysInWeek = (java.time.temporal.ChronoUnit.DAYS.between(weekStart, weekEnd) + 1).toInt()
            val weekAvg = if (daysInWeek > 0) weekTotal / daysInWeek else 0

            // Last week usage
            val lastWeekUsage = dailyUsageDao.getUsageForDateRange(lastWeekStart, lastWeekEnd)
            val lastWeekTotal = lastWeekUsage.sumOf { it.usedSeconds }

            // Per-app breakdown (this week)
            val perApp = thisWeekUsage
                .groupBy { it.packageName }
                .map { (pkg, usages) -> AppUsageStat(pkg, usages.sumOf { it.usedSeconds }) }
                .sortedByDescending { it.usedSeconds }

            // Trading
            val totalProfit = tradeUnlockDao.getTotalProfit()
            val totalTradeCount = tradeUnlockDao.getTotalTradeCount()
            val bestTrade = tradeUnlockDao.getBestTrade() ?: 0.0

            // Bypasses
            val bypassesThisWeek = bypassLogDao.getBypassCountForRange(weekStart, weekEnd)
            val bypassesLastWeek = bypassLogDao.getBypassCountForRange(lastWeekStart, lastWeekEnd)
            val bypassesAllTime = bypassLogDao.getTotalBypassCount()

            // Achievements — ensure rows exist and check
            try {
                // Calculate streak for achievement checking
                var streak = 0
                var day = today.minusDays(1)
                while (tradeUnlockDao.hasUnlockForDate(day)) {
                    streak++
                    day = day.minusDays(1)
                }
                if (tradeUnlockDao.hasUnlockForDate(today)) streak++
                achievementChecker.checkAll(streak)
            } catch (_: Exception) { }

            val achievementEntities = achievementDao.getAll()
            val achievementDisplays = AchievementDef.entries.map { def ->
                val entity = achievementEntities.find { it.id == def.id }
                    ?: Achievement(id = def.id)
                AchievementDisplay(def, entity)
            }

            _state.value = StatsState(
                isLoading = false,
                weekTotalSeconds = weekTotal,
                weekDailyAvgSeconds = weekAvg,
                lastWeekTotalSeconds = lastWeekTotal,
                perAppUsage = perApp,
                totalProfit = totalProfit,
                totalTradeCount = totalTradeCount,
                bestTrade = bestTrade,
                bypassesThisWeek = bypassesThisWeek,
                bypassesLastWeek = bypassesLastWeek,
                bypassesAllTime = bypassesAllTime,
                achievements = achievementDisplays
            )
        }
    }
}
