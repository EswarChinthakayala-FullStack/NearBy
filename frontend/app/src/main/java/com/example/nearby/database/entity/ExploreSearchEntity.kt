package com.example.nearby.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "explore_recent_searches")
data class ExploreRecentSearchEntity(
    @PrimaryKey val query: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "explore_categories")
data class ExploreCategoryEntity(
    @PrimaryKey val slug: String,
    val name: String,
    val icon: String,
    val count: Int
)

@Entity(tableName = "explore_search_results")
data class ExploreSearchResultEntity(
    @PrimaryKey val cacheKey: String, // query + latitude + longitude + filters_hash + page
    val jsonContent: String, // Serialized JSON string of results list
    val timestamp: Long = System.currentTimeMillis()
)
