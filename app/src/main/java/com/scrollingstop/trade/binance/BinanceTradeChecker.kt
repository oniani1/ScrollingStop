package com.scrollingstop.trade.binance

import android.util.Log
import com.scrollingstop.data.preferences.SecurePreferences
import java.time.LocalDate
import java.time.ZoneId
import javax.inject.Inject
import javax.inject.Singleton

data class TradeResult(
    val found: Boolean,
    val profitUsd: Double = 0.0,
    val source: String = "binance",
    val details: String = ""
)

@Singleton
class BinanceTradeChecker @Inject constructor(
    private val spotApi: BinanceApi,
    private val prefs: SecurePreferences
) {
    companion object {
        private const val TAG = "BinanceTradeChecker"

        // Common USDT pairs to scan
        private val SPOT_SYMBOLS = listOf(
            "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
            "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "DOTUSDT", "MATICUSDT",
            "LINKUSDT", "LTCUSDT", "UNIUSDT", "ATOMUSDT", "NEARUSDT",
            "APTUSDT", "ARBUSDT", "OPUSDT", "SUIUSDT", "PEPEUSDT"
        )
    }

    /**
     * Check today's spot trades for profit >= threshold.
     * Returns the first qualifying trade result found.
     */
    suspend fun checkTodaysTrades(): TradeResult {
        if (!prefs.hasBinanceKeys) {
            return TradeResult(found = false, details = "No API keys configured")
        }

        val threshold = prefs.profitThresholdUsd.toDouble()
        val today = LocalDate.now()
        val startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
        val endOfDay = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()

        // Check spot trades
        val spotResult = checkSpotTrades(startOfDay, endOfDay, threshold)
        if (spotResult.found) return spotResult

        // Check futures trades
        val futuresResult = checkFuturesTrades(startOfDay, endOfDay, threshold)
        if (futuresResult.found) return futuresResult

        return TradeResult(found = false, details = "No qualifying trades today")
    }

    /**
     * Validates that the API key pair works by calling the account endpoint.
     */
    suspend fun validateApiKeys(): Boolean {
        return try {
            val account = spotApi.getAccount()
            account.canTrade
        } catch (e: Exception) {
            Log.e(TAG, "API key validation failed", e)
            false
        }
    }

    private suspend fun checkSpotTrades(
        startTime: Long,
        endTime: Long,
        threshold: Double
    ): TradeResult {
        for (symbol in SPOT_SYMBOLS) {
            try {
                val trades = spotApi.getSpotTrades(
                    symbol = symbol,
                    startTime = startTime,
                    endTime = endTime
                )

                if (trades.isEmpty()) continue

                val profit = calculateSpotProfit(trades)
                if (profit >= threshold) {
                    val details = buildSpotDetails(symbol, trades, profit)
                    Log.d(TAG, "Qualifying spot trade: $symbol profit=$profit")
                    return TradeResult(
                        found = true,
                        profitUsd = profit,
                        source = "binance_spot",
                        details = details
                    )
                }
            } catch (e: Exception) {
                // Skip symbol on error (might not have trades or permission)
                Log.d(TAG, "Error checking $symbol: ${e.message}")
            }
        }
        return TradeResult(found = false)
    }

    private suspend fun checkFuturesTrades(
        startTime: Long,
        endTime: Long,
        threshold: Double
    ): TradeResult {
        for (symbol in SPOT_SYMBOLS) {
            try {
                val trades = spotApi.getFuturesTrades(
                    symbol = symbol,
                    startTime = startTime,
                    endTime = endTime
                )

                if (trades.isEmpty()) continue

                // Futures trades have realizedPnl directly
                val totalPnl = trades.sumOf { it.realizedPnl.toDoubleOrNull() ?: 0.0 }
                val totalCommission = trades.sumOf { it.commission.toDoubleOrNull() ?: 0.0 }
                val netProfit = totalPnl - totalCommission

                if (netProfit >= threshold) {
                    val details = """{"symbol":"$symbol","type":"futures","pnl":$totalPnl,"commission":$totalCommission,"net":$netProfit,"trades":${trades.size}}"""
                    Log.d(TAG, "Qualifying futures trade: $symbol profit=$netProfit")
                    return TradeResult(
                        found = true,
                        profitUsd = netProfit,
                        source = "binance_futures",
                        details = details
                    )
                }
            } catch (e: Exception) {
                Log.d(TAG, "Error checking futures $symbol: ${e.message}")
            }
        }
        return TradeResult(found = false)
    }

    /**
     * Calculate profit from spot trades on a single symbol.
     *
     * Groups by orderId, matches buy/sell pairs, calculates
     * (sell quoteQty - buy quoteQty) minus commissions.
     */
    private fun calculateSpotProfit(trades: List<SpotTrade>): Double {
        val buys = trades.filter { it.isBuyer }
        val sells = trades.filter { !it.isBuyer }

        if (buys.isEmpty() || sells.isEmpty()) return 0.0

        val totalBuyQuote = buys.sumOf { it.quoteQty.toDoubleOrNull() ?: 0.0 }
        val totalSellQuote = sells.sumOf { it.quoteQty.toDoubleOrNull() ?: 0.0 }

        // Calculate commission in USDT terms
        val usdtCommission = trades
            .filter { it.commissionAsset == "USDT" || it.commissionAsset == "USDC" || it.commissionAsset == "BUSD" }
            .sumOf { it.commission.toDoubleOrNull() ?: 0.0 }

        // Gross profit = sell proceeds - buy cost
        // If user only sold (already held), count full sell value minus commission
        return if (buys.isEmpty()) {
            totalSellQuote - usdtCommission
        } else {
            totalSellQuote - totalBuyQuote - usdtCommission
        }
    }

    private fun buildSpotDetails(
        symbol: String,
        trades: List<SpotTrade>,
        profit: Double
    ): String {
        val buys = trades.count { it.isBuyer }
        val sells = trades.count { !it.isBuyer }
        return """{"symbol":"$symbol","type":"spot","buys":$buys,"sells":$sells,"profit":$profit,"trades":${trades.size}}"""
    }
}
