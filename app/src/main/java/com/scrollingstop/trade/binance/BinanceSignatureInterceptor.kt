package com.scrollingstop.trade.binance

import com.scrollingstop.data.preferences.SecurePreferences
import okhttp3.Interceptor
import okhttp3.Response
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

/**
 * OkHttp interceptor that adds HMAC-SHA256 signature to Binance API requests.
 *
 * Only signs requests to endpoints that require authentication
 * (those with a `timestamp` query parameter).
 */
class BinanceSignatureInterceptor(
    private val prefs: SecurePreferences
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val url = original.url

        // Only sign requests that have a timestamp param (authenticated endpoints)
        val hasTimestamp = url.queryParameter("timestamp") != null
        if (!hasTimestamp) {
            return chain.proceed(original)
        }

        val apiKey = prefs.binanceApiKey
        val apiSecret = prefs.binanceApiSecret

        if (apiKey.isBlank() || apiSecret.isBlank()) {
            return chain.proceed(original)
        }

        // Build query string from existing params
        val queryString = buildString {
            for (i in 0 until url.querySize) {
                if (i > 0) append("&")
                append(url.queryParameterName(i))
                append("=")
                append(url.queryParameterValue(i))
            }
        }

        // Generate HMAC-SHA256 signature
        val signature = hmacSha256(apiSecret, queryString)

        // Rebuild URL with signature appended
        val signedUrl = url.newBuilder()
            .addQueryParameter("signature", signature)
            .build()

        val signedRequest = original.newBuilder()
            .url(signedUrl)
            .header("X-MBX-APIKEY", apiKey)
            .build()

        return chain.proceed(signedRequest)
    }

    companion object {
        fun hmacSha256(key: String, data: String): String {
            val mac = Mac.getInstance("HmacSHA256")
            val secretKey = SecretKeySpec(key.toByteArray(Charsets.UTF_8), "HmacSHA256")
            mac.init(secretKey)
            val hash = mac.doFinal(data.toByteArray(Charsets.UTF_8))
            return hash.joinToString("") { "%02x".format(it) }
        }
    }
}
