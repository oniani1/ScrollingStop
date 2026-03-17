package com.scrollingstop.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.scrollingstop.data.db.BlockedAppDao
import com.scrollingstop.data.db.BypassLogDao
import com.scrollingstop.data.db.DailyUsageDao
import com.scrollingstop.data.db.TradeUnlockDao
import com.scrollingstop.data.model.TradeUnlock
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.trade.TradeCheckManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

data class DashboardState(
    val usedSeconds: Int = 0,
    val limitSeconds: Int = 3600,
    val isUnlocked: Boolean = false,
    val todayUnlock: TradeUnlock? = null,
    val streakDays: Int = 0,
    val weeklyTradeUnlocks: Int = 0,
    val weeklyBypasses: Int = 0,
    val isCheckingTrade: Boolean = false,
    val tradeCheckMessage: String? = null
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val dailyUsageDao: DailyUsageDao,
    private val tradeUnlockDao: TradeUnlockDao,
    private val bypassLogDao: BypassLogDao,
    private val tradeCheckManager: TradeCheckManager,
    val prefs: SecurePreferences
) : ViewModel() {

    private val _state = MutableStateFlow(DashboardState())
    val state: StateFlow<DashboardState> = _state.asStateFlow()

    val todayUsage = dailyUsageDao.getTotalUsageForDate(LocalDate.now())
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            val today = LocalDate.now()
            val weekAgo = today.minusDays(7)

            val used = dailyUsageDao.getTotalUsageForDateOnce(today)
            val unlock = tradeUnlockDao.getUnlockForDateOnce(today)
            val weeklyUnlocks = tradeUnlockDao.getTradeUnlockCount(weekAgo, today)
            val weeklyBypasses = bypassLogDao.getBypassCountSince(weekAgo)

            // Calculate streak
            var streak = 0
            var day = today.minusDays(1)
            while (tradeUnlockDao.hasUnlockForDate(day)) {
                streak++
                day = day.minusDays(1)
            }
            if (unlock != null) streak++

            _state.value = _state.value.copy(
                usedSeconds = used,
                limitSeconds = prefs.dailyLimitSeconds,
                isUnlocked = unlock != null,
                todayUnlock = unlock,
                streakDays = streak,
                weeklyTradeUnlocks = weeklyUnlocks,
                weeklyBypasses = weeklyBypasses
            )
        }
    }

    fun checkTrade() {
        if (_state.value.isCheckingTrade) return

        _state.value = _state.value.copy(isCheckingTrade = true, tradeCheckMessage = null)

        viewModelScope.launch {
            try {
                val result = tradeCheckManager.checkForQualifyingTrade()
                _state.value = _state.value.copy(
                    isCheckingTrade = false,
                    tradeCheckMessage = if (result.found) {
                        "Trade found! +$${String.format("%.2f", result.profitUsd)}"
                    } else {
                        result.details
                    }
                )
                if (result.found) refresh()
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isCheckingTrade = false,
                    tradeCheckMessage = "Check failed"
                )
            }
        }
    }
}
