package com.example.nearby.di

import android.content.Context
import androidx.room.Room
import com.example.nearby.database.CacheDao
import com.example.nearby.database.NearbyDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideNearbyDatabase(
        @ApplicationContext context: Context
    ): NearbyDatabase {
        return Room.databaseBuilder(
            context,
            NearbyDatabase::class.java,
            NearbyDatabase.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    @Singleton
    fun provideCacheDao(database: NearbyDatabase): CacheDao {
        return database.cacheDao()
    }

    @Provides
    @Singleton
    fun provideFavoriteDao(database: NearbyDatabase): com.example.nearby.database.FavoriteDao {
        return database.favoriteDao()
    }

    @Provides
    @Singleton
    fun provideExploreSearchDao(database: NearbyDatabase): com.example.nearby.database.dao.ExploreSearchDao {
        return database.exploreSearchDao()
    }
}
