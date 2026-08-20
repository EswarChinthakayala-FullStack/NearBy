package com.tourismguide.app.data.local.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.tourismguide.app.data.local.dao.CategoryCacheDao
import com.tourismguide.app.data.local.dao.FavoritePlaceDao
import com.tourismguide.app.data.local.dao.PlaceCacheDao
import com.tourismguide.app.data.local.dao.RecentPlaceDao
import com.tourismguide.app.data.local.dao.ReviewCacheDao
import com.tourismguide.app.data.local.dao.SearchHistoryDao
import com.tourismguide.app.data.local.dao.UserDao
import com.tourismguide.app.data.local.entity.CategoryEntity
import com.tourismguide.app.data.local.entity.FavoritePlaceEntity
import com.tourismguide.app.data.local.entity.PlaceCacheEntity
import com.tourismguide.app.data.local.entity.RecentPlaceEntity
import com.tourismguide.app.data.local.entity.ReviewEntity
import com.tourismguide.app.data.local.entity.SearchHistoryEntity
import com.tourismguide.app.data.local.entity.UserEntity

@Database(
    entities = [
        PlaceCacheEntity::class,
        FavoritePlaceEntity::class,
        RecentPlaceEntity::class,
        SearchHistoryEntity::class,
        CategoryEntity::class,
        ReviewEntity::class,
        UserEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun placeCacheDao(): PlaceCacheDao
    abstract fun favoritePlaceDao(): FavoritePlaceDao
    abstract fun recentPlaceDao(): RecentPlaceDao
    abstract fun searchHistoryDao(): SearchHistoryDao
    abstract fun categoryCacheDao(): CategoryCacheDao
    abstract fun reviewCacheDao(): ReviewCacheDao
    abstract fun userDao(): UserDao
}
