package com.tourismguide.app.data.remote.datasource

import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.CategoriesApiService
import com.tourismguide.app.data.remote.dto.CategoryDto
import javax.inject.Inject

class CategoryRemoteDataSource @Inject constructor(
    private val categoriesApiService: CategoriesApiService
) {
    suspend fun getCategories(): ApiResult<List<CategoryDto>> {
        return try {
            val response = categoriesApiService.getCategories()
            val apiDto = response.body()
            if (response.isSuccessful && apiDto != null && apiDto.data != null) {
                ApiResult.Success(apiDto.data)
            } else {
                ApiResult.ServerError(response.code(), response.message())
            }
        } catch (e: Exception) {
            ApiResult.UnknownError(e)
        }
    }
}
