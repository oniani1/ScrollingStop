package com.scrollstop76

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import com.facebook.react.bridge.*

class AppBlockerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val PREFS_NAME = "ScrollStopPrefs"
        const val KEY_BLOCKED_APPS = "blocked_apps"
        const val KEY_UNLOCKED_TODAY = "unlocked_today"
    }

    override fun getName(): String = "AppBlockerModule"

    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        try {
            val am = reactContext.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
            val enabledServices = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
            val isEnabled = enabledServices.any {
                it.resolveInfo.serviceInfo.packageName == reactContext.packageName &&
                it.resolveInfo.serviceInfo.name == ScrollStopAccessibilityService::class.java.name
            }
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_OPEN_SETTINGS", e.message)
        }
    }

    @ReactMethod
    fun updateBlockedApps(packages: ReadableArray, promise: Promise) {
        try {
            val packageList = mutableListOf<String>()
            for (i in 0 until packages.size()) {
                packages.getString(i)?.let { packageList.add(it) }
            }
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putStringSet(KEY_BLOCKED_APPS, packageList.toSet()).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_UPDATE_APPS", e.message)
        }
    }

    @ReactMethod
    fun setHapticEnabled(enabled: Boolean, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean("haptic_enabled", enabled).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_SET_HAPTIC", e.message)
        }
    }

    @ReactMethod
    fun setDailyLimit(minutes: Int, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putInt("daily_limit_minutes", minutes).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_SET_LIMIT", e.message)
        }
    }

    @ReactMethod
    fun setUnlockedToday(unlocked: Boolean, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean(KEY_UNLOCKED_TODAY, unlocked).apply()

            // If unlocked, dismiss the overlay
            if (unlocked) {
                val intent = Intent(reactContext, BlockOverlayService::class.java)
                reactContext.stopService(intent)
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_SET_UNLOCKED", e.message)
        }
    }
}
