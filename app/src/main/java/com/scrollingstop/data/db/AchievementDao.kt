package com.scrollingstop.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.scrollingstop.data.model.Achievement
import java.time.Instant

@Dao
interface AchievementDao {
    @Query("SELECT * FROM Achievement")
    suspend fun getAll(): List<Achievement>

    @Query("SELECT * FROM Achievement WHERE id = :id")
    suspend fun getById(id: String): Achievement?

    @Query("SELECT EXISTS(SELECT 1 FROM Achievement WHERE id = :id AND unlockedAt IS NOT NULL)")
    suspend fun isUnlocked(id: String): Boolean

    @Query("UPDATE Achievement SET unlockedAt = :instant WHERE id = :id")
    suspend fun unlock(id: String, instant: Instant)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertIfAbsent(achievement: Achievement)
}
