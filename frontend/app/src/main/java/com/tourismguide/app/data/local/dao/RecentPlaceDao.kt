package com.tourismguide.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.tourismguide.app.data.local.entity.CategoryEntity
import com.tourismguide.app.data.local.entity.RecentPlaceEntity
import com.tourismguide.app.data.local.entity.ReviewEntity
import com.tourismguide.app.data.local.entity.SearchHistoryEntity
import com.tourismguide.app.data.local.entity.UserEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RecentPlaceDao {
    @Query("SELECT * FROM recent_places ORDER BY visited_at DESC LIMIT 10")
    fun getRecentPlaces(): Flow<List<RecentPlaceEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecentPlace(recentPlace: RecentPlaceEntity)
}

@Dao
interface SearchHistoryDao {
    @Query("SELECT * FROM search_history ORDER BY searched_at DESC LIMIT 15")
    fun getRecentSearches(): Flow<List<SearchHistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSearchQuery(searchHistory: SearchHistoryEntity)

    @Query("DELETE FROM search_history")
    suspend fun clearSearchHistory()
}

@Dao
interface CategoryCacheDao {
    @Query("SELECT * FROM categories")
    fun getCategories(): Flow<List<CategoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategories(categories: List<CategoryEntity>)
}

@Dao
interface ReviewCacheDao {
    @Query("SELECT * FROM reviews WHERE place_id = :placeId")
    fun getReviewsForPlace(placeId: String): Flow<List<ReviewEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReviews(reviews: List<ReviewEntity>)
}

@Dao
interface UserDao {
    @Query("SELECT * FROM user_profile LIMIT 1")
    fun getUserProfile(): Flow<UserEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveUserProfile(user: UserEntity)

    @Query("DELETE FROM user_profile")
    suspend fun clearUserProfile()
}
