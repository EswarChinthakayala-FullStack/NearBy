package com.tourismguide.app.domain.repository

import com.tourismguide.app.common.base.Resource
import com.tourismguide.app.domain.model.Category
import com.tourismguide.app.domain.model.DirectionsResult
import com.tourismguide.app.domain.model.Favorite
import com.tourismguide.app.domain.model.PlaceListItem
import com.tourismguide.app.domain.model.Review
import com.tourismguide.app.domain.model.User
import kotlinx.coroutines.flow.Flow

interface CategoriesRepository {
    fun getCategories(): Flow<Resource<List<Category>>>
}

interface ReviewsRepository {
    fun getReviews(placeId: String): Flow<Resource<List<Review>>>
    suspend fun submitReview(placeId: String, rating: Double, comment: String): Resource<Review>
}

interface FavoritesRepository {
    fun getFavorites(): Flow<Resource<List<Favorite>>>
    suspend fun toggleFavorite(placeId: String): Resource<Boolean>
}

interface DirectionsRepository {
    suspend fun getDirections(originLat: Double, originLng: Double, destLat: Double, destLng: Double): Resource<DirectionsResult>
}

interface SearchRepository {
    fun searchPlaces(query: String, category: String?): Flow<Resource<List<PlaceListItem>>>
    fun getRecentSearches(): Flow<List<String>>
    suspend fun saveSearchQuery(query: String)
}

interface UserRepository {
    fun getUserProfile(): Flow<Resource<User>>
    suspend fun updateProfile(fullName: String, phone: String): Resource<User>
}
