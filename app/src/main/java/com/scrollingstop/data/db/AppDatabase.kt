package com.scrollingstop.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.scrollingstop.data.model.BlockedApp
import com.scrollingstop.data.model.BypassLog
import com.scrollingstop.data.model.DailyUsage
import com.scrollingstop.data.model.TradeUnlock

@Database(
    entities = [BlockedApp::class, DailyUsage::class, TradeUnlock::class, BypassLog::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun blockedAppDao(): BlockedAppDao
    abstract fun dailyUsageDao(): DailyUsageDao
    abstract fun tradeUnlockDao(): TradeUnlockDao
    abstract fun bypassLogDao(): BypassLogDao
}
