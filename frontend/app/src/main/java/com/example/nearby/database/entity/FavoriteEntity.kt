package com.example.nearby.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey val slug: String,
    val isFavorited: Boolean,
    val syncStatus: String // "SYNCED", "PENDING_ADD", "PENDING_REMOVE"
)
