package com.scrollingstop.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.scrollingstop.data.model.DailyUsage
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate

@Dao
interface DailyUsageDao {
    @Query("SELECT * FROM DailyUsage WHERE date = :date")
    fun getUsageForDate(date: LocalDate): Flow<List<DailyUsage>>

    @Query("SELECT COALESCE(SUM(usedSeconds), 0) FROM DailyUsage WHERE date = :date")
    fun getTotalUsageForDate(date: LocalDate): Flow<Int>

    @Query("SELECT COALESCE(SUM(usedSeconds), 0) FROM DailyUsage WHERE date = :date")
    suspend fun getTotalUsageForDateOnce(date: LocalDate): Int

    @Query("SELECT COALESCE(SUM(usedSeconds), 0) FROM DailyUsage WHERE date = :date AND packageName = :packageName")
    suspend fun getUsageForApp(date: LocalDate, packageName: String): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(usage: DailyUsage)

    @Query("UPDATE DailyUsage SET usedSeconds = usedSeconds + :seconds WHERE date = :date AND packageName = :packageName")
    suspend fun incrementUsage(date: LocalDate, packageName: String, seconds: Int): Int

    @Query("INSERT OR IGNORE INTO DailyUsage (date, packageName, usedSeconds) VALUES (:date, :packageName, 0)")
    suspend fun ensureExists(date: LocalDate, packageName: String)
}
