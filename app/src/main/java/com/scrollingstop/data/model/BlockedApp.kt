package com.scrollingstop.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class BlockedApp(
    @PrimaryKey val packageName: String,
    val displayName: String,
    val iconUri: String? = null
)
