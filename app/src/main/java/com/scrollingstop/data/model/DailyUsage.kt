package com.scrollingstop.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDate

@Entity(primaryKeys = ["date", "packageName"])
data class DailyUsage(
    val date: LocalDate,
    val packageName: String,
    val usedSeconds: Int = 0
)
