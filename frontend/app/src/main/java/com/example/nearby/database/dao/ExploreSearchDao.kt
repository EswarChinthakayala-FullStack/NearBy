package com.example.nearby.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.nearby.database.entity.ExploreCategoryEntity
import com.example.nearby.database.entity.ExploreRecentSearchEntity
import com.example.nearby.database.entity.ExploreSearchResultEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ExploreSearchDao {

    // Recent Searches
    @Query("SELECT * FROM explore_recent_searches ORDER BY timestamp DESC LIMIT 10")
    fun getRecentSearchesFlow(): Flow<List<ExploreRecentSearchEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecentSearch(query: ExploreRecentSearchEntity)

    @Query("DELETE FROM explore_recent_searches WHERE `query` = :query")
    suspend fun deleteRecentSearch(query: String)

    @Query("DELETE FROM explore_recent_searches")
    suspend fun clearAllRecentSearches()

    // Categories
    @Query("SELECT * FROM explore_categories")
    suspend fun getCachedCategories(): List<ExploreCategoryEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategories(categories: List<ExploreCategoryEntity>)

    // Search Results Cache
    @Query("SELECT * FROM explore_search_results WHERE cacheKey = :key")
    suspend fun getSearchResultByKey(key: String): ExploreSearchResultEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSearchResult(result: ExploreSearchResultEntity)

    @Query("DELETE FROM explore_search_results WHERE timestamp < :expiryTime")
    suspend fun purgeExpiredSearchResults(expiryTime: Long)
}
