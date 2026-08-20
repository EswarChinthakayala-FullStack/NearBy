package com.example.nearby.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.nearby.database.entity.CacheEntity

@Dao
interface CacheDao {

    @Query("SELECT * FROM system_cache WHERE `key` = :key LIMIT 1")
    suspend fun getCache(key: String): CacheEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCache(entity: CacheEntity)

    @Query("DELETE FROM system_cache WHERE `key` = :key")
    suspend fun deleteCache(key: String)

    @Query("DELETE FROM system_cache")
    suspend fun clearAllCache()
}
