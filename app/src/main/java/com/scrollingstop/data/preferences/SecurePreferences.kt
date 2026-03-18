package com.scrollingstop.data.preferences

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SecurePreferences @Inject constructor(
    @ApplicationContext context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "scrollingstop_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    // Binance
    var binanceApiKey: String
        get() = prefs.getString(KEY_BINANCE_API_KEY, "") ?: ""
        set(value) = prefs.edit().putString(KEY_BINANCE_API_KEY, value).apply()

    var binanceApiSecret: String
        get() = prefs.getString(KEY_BINANCE_API_SECRET, "") ?: ""
        set(value) = prefs.edit().putString(KEY_BINANCE_API_SECRET, value).apply()

    val hasBinanceKeys: Boolean
        get() = binanceApiKey.isNotBlank() && binanceApiSecret.isNotBlank()

    // Solana
    var solanaWalletAddress: String
        get() = prefs.getString(KEY_SOLANA_WALLET, "") ?: ""
        set(value) = prefs.edit().putString(KEY_SOLANA_WALLET, value).apply()

    var solanaWalletVerified: Boolean
        get() = prefs.getBoolean(KEY_SOLANA_VERIFIED, false)
        set(value) = prefs.edit().putBoolean(KEY_SOLANA_VERIFIED, value).apply()

    val hasSolanaWallet: Boolean
        get() = solanaWalletAddress.isNotBlank() && solanaWalletVerified

    // Settings
    var dailyLimitSeconds: Int
        get() = prefs.getInt(KEY_DAILY_LIMIT, DEFAULT_DAILY_LIMIT)
        set(value) = prefs.edit().putInt(KEY_DAILY_LIMIT, value).apply()

    var profitThresholdUsd: Float
        get() = prefs.getFloat(KEY_PROFIT_THRESHOLD, DEFAULT_PROFIT_THRESHOLD)
        set(value) = prefs.edit().putFloat(KEY_PROFIT_THRESHOLD, value).apply()

    var bypassPhrase: String
        get() = prefs.getString(KEY_BYPASS_PHRASE, DEFAULT_BYPASS_PHRASE) ?: DEFAULT_BYPASS_PHRASE
        set(value) = prefs.edit().putString(KEY_BYPASS_PHRASE, value).apply()

    var onboardingCompleted: Boolean
        get() = prefs.getBoolean(KEY_ONBOARDING_DONE, false)
        set(value) = prefs.edit().putBoolean(KEY_ONBOARDING_DONE, value).apply()

    var monitoringEnabled: Boolean
        get() = prefs.getBoolean(KEY_MONITORING_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_MONITORING_ENABLED, value).apply()

    var streakShields: Int
        get() = prefs.getInt(KEY_STREAK_SHIELDS, 0)
        set(value) = prefs.edit().putInt(KEY_STREAK_SHIELDS, value).apply()

    var lastKnownStreak: Int
        get() = prefs.getInt(KEY_LAST_KNOWN_STREAK, 0)
        set(value) = prefs.edit().putInt(KEY_LAST_KNOWN_STREAK, value).apply()

    fun clearBinanceKeys() {
        prefs.edit()
            .remove(KEY_BINANCE_API_KEY)
            .remove(KEY_BINANCE_API_SECRET)
            .apply()
    }

    fun clearSolanaWallet() {
        prefs.edit()
            .remove(KEY_SOLANA_WALLET)
            .remove(KEY_SOLANA_VERIFIED)
            .apply()
    }

    companion object {
        private const val KEY_BINANCE_API_KEY = "binance_api_key"
        private const val KEY_BINANCE_API_SECRET = "binance_api_secret"
        private const val KEY_SOLANA_WALLET = "solana_wallet_address"
        private const val KEY_SOLANA_VERIFIED = "solana_wallet_verified"
        private const val KEY_DAILY_LIMIT = "daily_limit_seconds"
        private const val KEY_PROFIT_THRESHOLD = "profit_threshold_usd"
        private const val KEY_BYPASS_PHRASE = "bypass_phrase"
        private const val KEY_ONBOARDING_DONE = "onboarding_completed"
        private const val KEY_MONITORING_ENABLED = "monitoring_enabled"
        private const val KEY_STREAK_SHIELDS = "streak_shields"
        private const val KEY_LAST_KNOWN_STREAK = "last_known_streak"

        const val DEFAULT_DAILY_LIMIT = 3600 // 1 hour
        const val DEFAULT_PROFIT_THRESHOLD = 100f
        const val DEFAULT_BYPASS_PHRASE = "I choose scrolling over making money"
    }
}
