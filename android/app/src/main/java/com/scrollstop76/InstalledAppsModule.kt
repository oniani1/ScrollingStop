package com.scrollstop76

import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream

class InstalledAppsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "InstalledAppsModule"

    private fun drawableToBitmap(drawable: Drawable): Bitmap {
        if (drawable is BitmapDrawable && drawable.bitmap != null) {
            return drawable.bitmap
        }
        val bmp = Bitmap.createBitmap(
            drawable.intrinsicWidth.coerceAtLeast(1),
            drawable.intrinsicHeight.coerceAtLeast(1),
            Bitmap.Config.ARGB_8888
        )
        val canvas = Canvas(bmp)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bmp
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val iconDir = File(reactContext.cacheDir, "app_icons").apply { mkdirs() }

            val launcherIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            val launcherApps = pm.queryIntentActivities(launcherIntent, 0)
            val apps = Arguments.createArray()
            val self = reactContext.packageName
            val seen = mutableSetOf<String>()

            for (ri in launcherApps) {
                val pkg = ri.activityInfo.packageName
                if (pkg == self || seen.contains(pkg)) continue
                seen.add(pkg)

                val label = ri.loadLabel(pm).toString()

                // Save icon to cache
                var iconPath = ""
                try {
                    val iconFile = File(iconDir, "$pkg.png")
                    if (!iconFile.exists()) {
                        val icon = ri.loadIcon(pm)
                        val bmp = drawableToBitmap(icon)
                        val scaled = Bitmap.createScaledBitmap(bmp, 96, 96, true)
                        FileOutputStream(iconFile).use { out ->
                            scaled.compress(Bitmap.CompressFormat.PNG, 90, out)
                        }
                        if (scaled !== bmp) scaled.recycle()
                    }
                    iconPath = iconFile.absolutePath
                } catch (_: Exception) {}

                val map = Arguments.createMap().apply {
                    putString("packageName", pkg)
                    putString("displayName", label)
                    putString("iconPath", iconPath)
                }
                apps.pushMap(map)
            }

            promise.resolve(apps)
        } catch (e: Exception) {
            promise.reject("ERR_GET_APPS", e.message)
        }
    }
}
