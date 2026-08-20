package com.tourismguide.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.tourismguide.app.data.local.entity.FavoritePlaceEntity
import com.tourismguide.app.data.local.entity.PlaceCacheEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PlaceCacheDao {
    @Query("SELECT * FROM place_cache")
    fun getAllCachedPlaces(): Flow<List<PlaceCacheEntity>>

    @Query("SELECT * FROM place_cache WHERE id = :placeId")
    suspend fun getPlaceById(placeId: String): PlaceCacheEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaces(places: List<PlaceCacheEntity>)

    @Query("DELETE FROM place_cache")
    suspend fun clearCache()
}

@Dao
interface FavoritePlaceDao {
    @Query("SELECT * FROM favorite_places ORDER BY added_at DESC")
    fun getFavorites(): Flow<List<FavoritePlaceEntity>>

    @Query("SELECT EXISTS(SELECT 1 FROM favorite_places WHERE placeId = :placeId)")
    suspend fun isFavorite(placeId: String): Boolean

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFavorite(favorite: FavoritePlaceEntity)

    @Query("DELETE FROM favorite_places WHERE placeId = :placeId")
    suspend fun deleteFavorite(placeId: String)
}
