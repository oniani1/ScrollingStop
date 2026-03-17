package com.scrollingstop.trade.binance

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.http.GET
import retrofit2.http.Query

interface BinanceApi {

    // Spot trades
    @GET("/api/v3/myTrades")
    suspend fun getSpotTrades(
        @Query("symbol") symbol: String,
        @Query("startTime") startTime: Long,
        @Query("endTime") endTime: Long,
        @Query("limit") limit: Int = 1000,
        @Query("timestamp") timestamp: Long = System.currentTimeMillis(),
        @Query("recvWindow") recvWindow: Long = 5000
    ): List<SpotTrade>

    // All open spot orders (used to get active symbols)
    @GET("/api/v3/exchangeInfo")
    suspend fun getExchangeInfo(): ExchangeInfo

    // Account info to verify API key works
    @GET("/api/v3/account")
    suspend fun getAccount(
        @Query("timestamp") timestamp: Long = System.currentTimeMillis(),
        @Query("recvWindow") recvWindow: Long = 5000
    ): AccountInfo

    // Recent trades for price reference
    @GET("/api/v3/ticker/price")
    suspend fun getTickerPrice(
        @Query("symbol") symbol: String
    ): TickerPrice

    // All ticker prices
    @GET("/api/v3/ticker/price")
    suspend fun getAllTickerPrices(): List<TickerPrice>

    // Futures trades
    @GET("/fapi/v1/userTrades")
    suspend fun getFuturesTrades(
        @Query("symbol") symbol: String,
        @Query("startTime") startTime: Long,
        @Query("endTime") endTime: Long,
        @Query("limit") limit: Int = 1000,
        @Query("timestamp") timestamp: Long = System.currentTimeMillis(),
        @Query("recvWindow") recvWindow: Long = 5000
    ): List<FuturesTrade>
}

@JsonClass(generateAdapter = true)
data class SpotTrade(
    @Json(name = "id") val id: Long,
    @Json(name = "symbol") val symbol: String,
    @Json(name = "orderId") val orderId: Long,
    @Json(name = "price") val price: String,
    @Json(name = "qty") val qty: String,
    @Json(name = "quoteQty") val quoteQty: String,
    @Json(name = "commission") val commission: String,
    @Json(name = "commissionAsset") val commissionAsset: String,
    @Json(name = "time") val time: Long,
    @Json(name = "isBuyer") val isBuyer: Boolean,
    @Json(name = "isMaker") val isMaker: Boolean
)

@JsonClass(generateAdapter = true)
data class FuturesTrade(
    @Json(name = "id") val id: Long,
    @Json(name = "symbol") val symbol: String,
    @Json(name = "orderId") val orderId: Long,
    @Json(name = "price") val price: String,
    @Json(name = "qty") val qty: String,
    @Json(name = "quoteQty") val quoteQty: String,
    @Json(name = "commission") val commission: String,
    @Json(name = "commissionAsset") val commissionAsset: String,
    @Json(name = "time") val time: Long,
    @Json(name = "side") val side: String,            // "BUY" or "SELL"
    @Json(name = "realizedPnl") val realizedPnl: String,
    @Json(name = "positionSide") val positionSide: String
)

@JsonClass(generateAdapter = true)
data class AccountInfo(
    @Json(name = "canTrade") val canTrade: Boolean,
    @Json(name = "canWithdraw") val canWithdraw: Boolean,
    @Json(name = "canDeposit") val canDeposit: Boolean
)

@JsonClass(generateAdapter = true)
data class ExchangeInfo(
    @Json(name = "symbols") val symbols: List<SymbolInfo>
)

@JsonClass(generateAdapter = true)
data class SymbolInfo(
    @Json(name = "symbol") val symbol: String,
    @Json(name = "status") val status: String,
    @Json(name = "baseAsset") val baseAsset: String,
    @Json(name = "quoteAsset") val quoteAsset: String
)

@JsonClass(generateAdapter = true)
data class TickerPrice(
    @Json(name = "symbol") val symbol: String,
    @Json(name = "price") val price: String
)
