package com.scrollingstop.ui.share

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.view.View
import android.widget.FrameLayout
import androidx.compose.ui.platform.ComposeView
import androidx.core.content.FileProvider
import com.scrollingstop.ui.stats.StatsState
import java.io.File

object ShareCardGenerator {

    fun shareStats(context: Context, state: StatsState) {
        // Create a simple bitmap with stats text
        val width = 1080
        val height = 1920
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Background
        canvas.drawColor(Color.parseColor("#0A0A0F"))

        val paint = android.graphics.Paint().apply {
            isAntiAlias = true
            color = Color.parseColor("#F5F5F5")
        }

        // Brand
        paint.textSize = 72f
        paint.isFakeBoldText = true
        val brandText = "ScrollStop"
        canvas.drawText(brandText, (width - paint.measureText(brandText)) / 2, 200f, paint)

        paint.textSize = 36f
        paint.isFakeBoldText = false
        paint.color = Color.parseColor("#4F8CFF")
        val tagline = "Stop scrolling. Start trading."
        canvas.drawText(tagline, (width - paint.measureText(tagline)) / 2, 260f, paint)

        // Hero stat - streak
        paint.color = Color.parseColor("#F5F5F5")
        paint.textSize = 180f
        paint.isFakeBoldText = true
        val days = "${(state.weekTotalSeconds / 86400).coerceAtLeast(0)}"
        // Use total profit or weekly info as hero

        if (state.totalProfit > 0) {
            paint.color = Color.parseColor("#34D399")
            paint.textSize = 120f
            val profitText = "$${String.format("%,.0f", state.totalProfit)}"
            canvas.drawText(profitText, (width - paint.measureText(profitText)) / 2, 650f, paint)

            paint.color = Color.parseColor("#BDBDBD")
            paint.textSize = 40f
            paint.isFakeBoldText = false
            val subText = "earned from forced trades"
            canvas.drawText(subText, (width - paint.measureText(subText)) / 2, 720f, paint)
        }

        // Stats
        paint.color = Color.parseColor("#F5F5F5")
        paint.textSize = 48f
        paint.isFakeBoldText = true

        val statsY = 950f
        val leftX = 120f

        canvas.drawText("This Week", leftX, statsY, paint)

        paint.isFakeBoldText = false
        paint.textSize = 40f
        paint.color = Color.parseColor("#BDBDBD")

        val weekHours = state.weekTotalSeconds / 3600
        val weekMin = (state.weekTotalSeconds % 3600) / 60
        val timeStr = if (weekHours > 0) "${weekHours}h ${weekMin}m" else "${weekMin}m"
        canvas.drawText("Screen time: $timeStr", leftX, statsY + 60f, paint)
        canvas.drawText("Trade unlocks: ${state.totalTradeCount}", leftX, statsY + 120f, paint)
        canvas.drawText("Best trade: $${String.format("%.2f", state.bestTrade)}", leftX, statsY + 180f, paint)
        canvas.drawText("Bypasses: ${state.bypassesThisWeek}", leftX, statsY + 240f, paint)

        // Achievements unlocked count
        val unlockedCount = state.achievements.count { it.achievement.unlockedAt != null }
        paint.color = Color.parseColor("#8B5CF6")
        canvas.drawText("$unlockedCount/${state.achievements.size} achievements unlocked", leftX, statsY + 340f, paint)

        // Watermark
        paint.color = Color.parseColor("#75757580")
        paint.textSize = 30f
        val watermark = "scrollstop.app"
        canvas.drawText(watermark, (width - paint.measureText(watermark)) / 2, 1850f, paint)

        // Save and share
        val file = File(context.cacheDir, "scrollstop_share.png")
        file.outputStream().use {
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, it)
        }
        bitmap.recycle()

        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )

        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "image/png"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(Intent.createChooser(shareIntent, "Share your ScrollStop stats").apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        })
    }
}
