package com.scrollingstop.trade

import android.util.Log
import com.scrollingstop.data.db.TradeUnlockDao
import com.scrollingstop.data.model.TradeUnlock
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.trade.binance.BinanceTradeChecker
import com.scrollingstop.trade.binance.TradeResult
import com.scrollingstop.trade.solana.SolanaTradeChecker
import java.time.Instant
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TradeCheckManager @Inject constructor(
    private val binanceChecker: BinanceTradeChecker,
    private val solanaChecker: SolanaTradeChecker,
    private val tradeUnlockDao: TradeUnlockDao,
    private val prefs: SecurePreferences
) {
    companion object {
        private const val TAG = "TradeCheckManager"
    }

    /**
     * Check all configured trading sources for a qualifying trade.
     * If found, records the unlock in the database.
     * Returns the result.
     */
    suspend fun checkForQualifyingTrade(): TradeResult {
        val today = LocalDate.now()

        // Already unlocked today?
        if (tradeUnlockDao.hasUnlockForDate(today)) {
            return TradeResult(
                found = true,
                source = "cached",
                details = "Already unlocked today"
            )
        }

        // Check Binance
        if (prefs.hasBinanceKeys) {
            try {
                val result = binanceChecker.checkTodaysTrades()
                if (result.found) {
                    recordUnlock(today, result)
                    return result
                }
            } catch (e: Exception) {
                Log.e(TAG, "Binance check failed", e)
            }
        }

        // Check Solana DEX
        if (prefs.hasSolanaWallet) {
            try {
                val result = solanaChecker.checkTodaysTrades()
                if (result.found) {
                    recordUnlock(today, result)
                    return result
                }
            } catch (e: Exception) {
                Log.e(TAG, "Solana check failed", e)
            }
        }

        return TradeResult(found = false, details = "No qualifying trades found")
    }

    private suspend fun recordUnlock(date: LocalDate, result: TradeResult) {
        tradeUnlockDao.insert(
            TradeUnlock(
                date = date,
                source = result.source,
                profitUsd = result.profitUsd,
                tradeDetails = result.details,
                unlockedAt = Instant.now()
            )
        )
        Log.d(TAG, "Trade unlock recorded: ${result.source} profit=${result.profitUsd}")
    }
}
