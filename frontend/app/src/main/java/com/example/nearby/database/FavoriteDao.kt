package com.example.nearby.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.nearby.database.entity.FavoriteEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FavoriteDao {
    @Query("SELECT * FROM favorites")
    fun getAllFavoritesFlow(): Flow<List<FavoriteEntity>>

    @Query("SELECT * FROM favorites WHERE syncStatus != 'SYNCED'")
    suspend fun getPendingFavorites(): List<FavoriteEntity>

    @Query("SELECT * FROM favorites WHERE slug = :slug")
    suspend fun getBySlug(slug: String): FavoriteEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(favorite: FavoriteEntity)

    @Query("DELETE FROM favorites WHERE slug = :slug")
    suspend fun delete(slug: String)

    @Query("DELETE FROM favorites")
    suspend fun deleteAll()
}
