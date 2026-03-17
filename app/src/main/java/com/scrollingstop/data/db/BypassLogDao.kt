package com.scrollingstop.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.scrollingstop.data.model.BypassLog
import java.time.LocalDate

@Dao
interface BypassLogDao {
    @Insert
    suspend fun insert(log: BypassLog)

    @Query("SELECT COUNT(*) FROM BypassLog WHERE date >= :since")
    suspend fun getBypassCountSince(since: LocalDate): Int

    @Query("SELECT COUNT(*) FROM BypassLog WHERE date = :date")
    suspend fun getBypassCountForDate(date: LocalDate): Int
}
