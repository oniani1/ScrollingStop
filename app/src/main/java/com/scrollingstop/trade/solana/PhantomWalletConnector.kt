package com.scrollingstop.trade.solana

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Base64
import android.util.Log
import com.scrollingstop.data.preferences.SecurePreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Handles Phantom wallet connection via deep links.
 *
 * Flow:
 * 1. App sends connect request to Phantom via deep link
 * 2. Phantom returns with the wallet's public key
 * 3. We store the public key for transaction lookups
 */
@Singleton
class PhantomWalletConnector @Inject constructor(
    @ApplicationContext private val context: Context,
    private val prefs: SecurePreferences
) {
    companion object {
        private const val TAG = "PhantomWallet"
        private const val PHANTOM_CONNECT_URL = "https://phantom.app/ul/v1/connect"
        const val REDIRECT_SCHEME = "scrollingstop"
        const val REDIRECT_HOST = "phantom-callback"
        const val REDIRECT_URI = "$REDIRECT_SCHEME://$REDIRECT_HOST"
    }

    /**
     * Launch Phantom to request wallet connection.
     * Returns the intent to start.
     */
    fun buildConnectIntent(): Intent {
        val params = mapOf(
            "app_url" to "https://scrollingstop.app",
            "dapp_encryption_public_key" to "", // Not needed for read-only
            "redirect_link" to "$REDIRECT_URI/connect",
            "cluster" to "mainnet-beta"
        )

        val uri = Uri.parse(PHANTOM_CONNECT_URL).buildUpon().apply {
            params.forEach { (key, value) ->
                appendQueryParameter(key, value)
            }
        }.build()

        return Intent(Intent.ACTION_VIEW, uri).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }

    /**
     * Handle the callback from Phantom after connect.
     * Extracts the public key from the redirect URI.
     */
    fun handleConnectCallback(uri: Uri): Boolean {
        return try {
            val publicKey = uri.getQueryParameter("phantom_encryption_public_key")
            val walletAddress = uri.getQueryParameter("public_key")

            if (walletAddress.isNullOrBlank()) {
                Log.e(TAG, "No wallet address in callback")
                return false
            }

            prefs.solanaWalletAddress = walletAddress
            prefs.solanaWalletVerified = true
            Log.d(TAG, "Phantom wallet connected: $walletAddress")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to handle Phantom callback", e)
            false
        }
    }

    /**
     * Disconnect wallet — clear stored data.
     */
    fun disconnect() {
        prefs.clearSolanaWallet()
    }

    /**
     * Validate a manually entered Solana address (base58, 32-44 chars).
     */
    fun validateAddress(address: String): Boolean {
        if (address.length !in 32..44) return false
        val base58Chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
        return address.all { it in base58Chars }
    }

    /**
     * Set wallet address manually (without Phantom deep link).
     */
    fun setAddressManually(address: String): Boolean {
        if (!validateAddress(address)) return false
        prefs.solanaWalletAddress = address
        prefs.solanaWalletVerified = true
        return true
    }
}
