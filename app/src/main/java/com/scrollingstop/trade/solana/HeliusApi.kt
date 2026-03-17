package com.scrollingstop.trade.solana

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.http.GET
import retrofit2.http.Query

interface HeliusApi {

    @GET("/v0/addresses/{address}/transactions")
    suspend fun getTransactions(
        @retrofit2.http.Path("address") address: String,
        @Query("api-key") apiKey: String = "",
        @Query("type") type: String = "SWAP",
        @Query("limit") limit: Int = 50
    ): List<HeliusTransaction>
}

@JsonClass(generateAdapter = true)
data class HeliusTransaction(
    @Json(name = "signature") val signature: String,
    @Json(name = "timestamp") val timestamp: Long,
    @Json(name = "type") val type: String,
    @Json(name = "source") val source: String = "",
    @Json(name = "tokenTransfers") val tokenTransfers: List<TokenTransfer> = emptyList(),
    @Json(name = "nativeTransfers") val nativeTransfers: List<NativeTransfer> = emptyList(),
    @Json(name = "description") val description: String = ""
)

@JsonClass(generateAdapter = true)
data class TokenTransfer(
    @Json(name = "mint") val mint: String,
    @Json(name = "fromUserAccount") val fromUserAccount: String = "",
    @Json(name = "toUserAccount") val toUserAccount: String = "",
    @Json(name = "tokenAmount") val tokenAmount: Double,
    @Json(name = "tokenStandard") val tokenStandard: String = ""
)

@JsonClass(generateAdapter = true)
data class NativeTransfer(
    @Json(name = "fromUserAccount") val fromUserAccount: String,
    @Json(name = "toUserAccount") val toUserAccount: String,
    @Json(name = "amount") val amount: Long
)
