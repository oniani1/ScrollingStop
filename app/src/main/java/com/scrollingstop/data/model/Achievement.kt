package com.scrollingstop.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.Instant

@Entity
data class Achievement(
    @PrimaryKey val id: String,
    val unlockedAt: Instant? = null
)
