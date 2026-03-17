package com.scrollingstop.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.scrollingstop.data.model.TradeUnlock
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate

@Dao
interface TradeUnlockDao {
    @Query("SELECT * FROM TradeUnlock WHERE date = :date LIMIT 1")
    fun getUnlockForDate(date: LocalDate): Flow<TradeUnlock?>

    @Query("SELECT * FROM TradeUnlock WHERE date = :date LIMIT 1")
    suspend fun getUnlockForDateOnce(date: LocalDate): TradeUnlock?

    @Query("SELECT EXISTS(SELECT 1 FROM TradeUnlock WHERE date = :date)")
    suspend fun hasUnlockForDate(date: LocalDate): Boolean

    @Query("SELECT EXISTS(SELECT 1 FROM TradeUnlock WHERE date = :date)")
    fun hasUnlockForDateFlow(date: LocalDate): Flow<Boolean>

    @Insert
    suspend fun insert(unlock: TradeUnlock)

    @Query("""
        SELECT COUNT(DISTINCT date) FROM TradeUnlock
        WHERE date >= :since
        AND date <= :until
    """)
    suspend fun getTradeUnlockCount(since: LocalDate, until: LocalDate): Int

    /**
     * Returns consecutive days with trade unlocks ending at [endDate].
     * Counts backwards from endDate until a gap is found.
     */
    @Query("""
        SELECT COUNT(*) FROM (
            SELECT DISTINCT date FROM TradeUnlock
            WHERE date <= :endDate
            ORDER BY date DESC
        ) AS dates
    """)
    suspend fun getAllTradeDaysCount(endDate: LocalDate): Int
}
