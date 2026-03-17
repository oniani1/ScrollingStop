package com.scrollingstop.trade.solana

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Query

interface BirdeyeApi {

    @GET("/defi/history_price")
    suspend fun getHistoricalPrice(
        @Query("address") tokenMint: String,
        @Query("address_type") addressType: String = "token",
        @Query("type") type: String = "1H",
        @Query("time_from") timeFrom: Long,
        @Query("time_to") timeTo: Long,
        @Header("X-API-KEY") apiKey: String = "",
        @Header("x-chain") chain: String = "solana"
    ): BirdeyePriceResponse

    @GET("/defi/price")
    suspend fun getCurrentPrice(
        @Query("address") tokenMint: String,
        @Header("X-API-KEY") apiKey: String = "",
        @Header("x-chain") chain: String = "solana"
    ): BirdeyeCurrentPriceResponse
}

@JsonClass(generateAdapter = true)
data class BirdeyePriceResponse(
    @Json(name = "data") val data: BirdeyePriceData? = null,
    @Json(name = "success") val success: Boolean = false
)

@JsonClass(generateAdapter = true)
data class BirdeyePriceData(
    @Json(name = "items") val items: List<BirdeyePriceItem> = emptyList()
)

@JsonClass(generateAdapter = true)
data class BirdeyePriceItem(
    @Json(name = "unixTime") val unixTime: Long,
    @Json(name = "value") val value: Double
)

@JsonClass(generateAdapter = true)
data class BirdeyeCurrentPriceResponse(
    @Json(name = "data") val data: BirdeyeCurrentPrice? = null,
    @Json(name = "success") val success: Boolean = false
)

@JsonClass(generateAdapter = true)
data class BirdeyeCurrentPrice(
    @Json(name = "value") val value: Double = 0.0
)
