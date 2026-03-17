package com.scrollingstop.data.db

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.scrollingstop.data.model.BlockedApp
import kotlinx.coroutines.flow.Flow

@Dao
interface BlockedAppDao {
    @Query("SELECT * FROM BlockedApp ORDER BY displayName")
    fun getAll(): Flow<List<BlockedApp>>

    @Query("SELECT * FROM BlockedApp")
    suspend fun getAllOnce(): List<BlockedApp>

    @Query("SELECT EXISTS(SELECT 1 FROM BlockedApp WHERE packageName = :packageName)")
    suspend fun isBlocked(packageName: String): Boolean

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(app: BlockedApp)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(apps: List<BlockedApp>)

    @Delete
    suspend fun delete(app: BlockedApp)

    @Query("DELETE FROM BlockedApp WHERE packageName = :packageName")
    suspend fun deleteByPackage(packageName: String)
}
