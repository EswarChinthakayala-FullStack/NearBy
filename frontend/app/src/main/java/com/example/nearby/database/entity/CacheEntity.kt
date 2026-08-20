package com.example.nearby.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "system_cache")
data class CacheEntity(
    @PrimaryKey val key: String,
    val payload: String,
    val timestamp: Long = System.currentTimeMillis()
)
