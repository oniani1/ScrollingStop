package com.scrollingstop.trade.solana

import android.util.Log
import com.scrollingstop.data.preferences.SecurePreferences
import com.scrollingstop.trade.binance.TradeResult
import java.time.LocalDate
import java.time.ZoneId
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SolanaTradeChecker @Inject constructor(
    private val heliusApi: HeliusApi,
    private val birdeyeApi: BirdeyeApi,
    private val prefs: SecurePreferences
) {
    companion object {
        private const val TAG = "SolanaTradeChecker"

        // Common stablecoins on Solana
        private val STABLECOIN_MINTS = setOf(
            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
            "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
            "USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA",  // USDS
        )

        // SOL mint
        private const val SOL_MINT = "So11111111111111111111111111111111111111112"
    }

    suspend fun checkTodaysTrades(): TradeResult {
        if (!prefs.hasSolanaWallet) {
            return TradeResult(found = false, details = "No Solana wallet connected")
        }

        val wallet = prefs.solanaWalletAddress
        val threshold = prefs.profitThresholdUsd.toDouble()
        val today = LocalDate.now()
        val startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant().epochSecond

        return try {
            val transactions = heliusApi.getTransactions(address = wallet)

            // Filter to today's swaps only
            val todaySwaps = transactions.filter {
                it.type == "SWAP" && it.timestamp >= startOfDay
            }

            if (todaySwaps.isEmpty()) {
                return TradeResult(found = false, details = "No swaps today")
            }

            // Calculate profit from each swap
            var totalProfit = 0.0
            val details = mutableListOf<String>()

            for (swap in todaySwaps) {
                val profit = calculateSwapProfit(swap, wallet)
                if (profit != null) {
                    totalProfit += profit
                    details.add("${swap.source}: $${String.format("%.2f", profit)}")
                }
            }

            if (totalProfit >= threshold) {
                TradeResult(
                    found = true,
                    profitUsd = totalProfit,
                    source = "solana_dex",
                    details = """{"wallet":"$wallet","swaps":${todaySwaps.size},"profit":$totalProfit,"breakdown":${details}}"""
                )
            } else {
                TradeResult(
                    found = false,
                    details = "Swaps found but profit ($${String.format("%.2f", totalProfit)}) below threshold"
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Solana trade check failed", e)
            TradeResult(found = false, details = "Solana check failed: ${e.message}")
        }
    }

    /**
     * Calculate USD profit from a single swap transaction.
     *
     * Logic:
     * - Identify tokens sent vs received by the wallet
     * - If stablecoin is involved, use its amount directly as USD value
     * - Otherwise, use Birdeye to get historical price at swap time
     * - Profit = value_received - value_sent
     */
    private suspend fun calculateSwapProfit(
        swap: HeliusTransaction,
        wallet: String
    ): Double? {
        val sent = mutableListOf<TokenMovement>()
        val received = mutableListOf<TokenMovement>()

        // Categorize token transfers
        for (transfer in swap.tokenTransfers) {
            if (transfer.fromUserAccount == wallet) {
                sent.add(TokenMovement(transfer.mint, transfer.tokenAmount))
            } else if (transfer.toUserAccount == wallet) {
                received.add(TokenMovement(transfer.mint, transfer.tokenAmount))
            }
        }

        // Include native SOL transfers
        for (transfer in swap.nativeTransfers) {
            val solAmount = transfer.amount / 1_000_000_000.0 // lamports to SOL
            if (transfer.fromUserAccount == wallet && solAmount > 0.001) {
                sent.add(TokenMovement(SOL_MINT, solAmount))
            } else if (transfer.toUserAccount == wallet && solAmount > 0.001) {
                received.add(TokenMovement(SOL_MINT, solAmount))
            }
        }

        if (sent.isEmpty() || received.isEmpty()) return null

        val sentValue = getUsdValue(sent, swap.timestamp)
        val receivedValue = getUsdValue(received, swap.timestamp)

        if (sentValue == null || receivedValue == null) return null

        return receivedValue - sentValue
    }

    private suspend fun getUsdValue(movements: List<TokenMovement>, timestamp: Long): Double? {
        var total = 0.0
        for (movement in movements) {
            val value = getTokenUsdValue(movement.mint, movement.amount, timestamp)
                ?: return null
            total += value
        }
        return total
    }

    private suspend fun getTokenUsdValue(mint: String, amount: Double, timestamp: Long): Double? {
        // Stablecoins: 1:1 with USD
        if (mint in STABLECOIN_MINTS) return amount

        return try {
            // Try Birdeye historical price
            val response = birdeyeApi.getHistoricalPrice(
                tokenMint = mint,
                timeFrom = timestamp - 3600,
                timeTo = timestamp + 3600
            )

            val priceAtTime = response.data?.items
                ?.minByOrNull { kotlin.math.abs(it.unixTime - timestamp) }
                ?.value

            if (priceAtTime != null) {
                amount * priceAtTime
            } else {
                // Fallback: current price
                val current = birdeyeApi.getCurrentPrice(tokenMint = mint)
                val currentPrice = current.data?.value ?: return null
                amount * currentPrice
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to get price for $mint: ${e.message}")
            null
        }
    }

    private data class TokenMovement(val mint: String, val amount: Double)
}
