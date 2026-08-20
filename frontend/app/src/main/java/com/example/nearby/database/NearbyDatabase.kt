package com.example.nearby.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.nearby.database.entity.CacheEntity

@Database(
    entities = [
        CacheEntity::class, 
        com.example.nearby.database.entity.FavoriteEntity::class,
        com.example.nearby.database.entity.ExploreRecentSearchEntity::class,
        com.example.nearby.database.entity.ExploreCategoryEntity::class,
        com.example.nearby.database.entity.ExploreSearchResultEntity::class
    ],
    version = 3,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class NearbyDatabase : RoomDatabase() {

    abstract fun cacheDao(): CacheDao
    abstract fun favoriteDao(): FavoriteDao
    abstract fun exploreSearchDao(): com.example.nearby.database.dao.ExploreSearchDao

    companion object {
        const val DATABASE_NAME = "nearby_app_db"
    }
}
