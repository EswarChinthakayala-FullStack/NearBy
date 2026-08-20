package com.tourismguide.app.data.remote.datasource

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.FavoritesApiService
import com.tourismguide.app.data.remote.dto.FavoriteDto
import javax.inject.Inject

class FavoriteRemoteDataSource @Inject constructor(
    private val favoritesApiService: FavoritesApiService
) {
    suspend fun getFavorites(): ApiResult<List<FavoriteDto>> {
        return try {
            val response = favoritesApiService.getFavorites()
            val apiDto = response.body()
            if (response.isSuccessful && apiDto != null) {
                ApiResult.Success(apiDto.items)
            } else {
                ApiResult.ServerError(response.code(), response.message())
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }
}
