package com.scrollingstop.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.Instant
import java.time.LocalDate

@Entity
data class TradeUnlock(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val date: LocalDate,
    val source: String,
    val profitUsd: Double,
    val tradeDetails: String,
    val unlockedAt: Instant
)
