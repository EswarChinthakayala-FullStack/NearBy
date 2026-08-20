package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import com.tourismguide.app.data.remote.dto.CategoryDto
import retrofit2.Response
import retrofit2.http.GET

interface CategoriesApiService {
    @GET("categories")
    suspend fun getCategories(): Response<ApiResponseDto<List<CategoryDto>>>
}
