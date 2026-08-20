package com.example.nearby.presentation.profile.reviews.data

import com.example.nearby.database.CacheDao
import com.example.nearby.database.entity.CacheEntity
import com.example.nearby.presentation.profile.reviews.model.UserReviewDomainModel
import com.tourismguide.app.common.base.Resource
import com.tourismguide.app.data.remote.api.ReviewsApiService
import com.tourismguide.app.data.remote.dto.ReviewCreateDto
import com.tourismguide.app.data.remote.dto.ReviewDto
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class UserReviewRepository @Inject constructor(
    private val apiService: ReviewsApiService,
    private val cacheDao: CacheDao
) {

    private val json = Json { ignoreUnknownKeys = true }
    private val CACHE_KEY = "user_reviews_cache"

    fun fetchUserReviews(page: Int = 1, pageSize: Int = 30): Flow<Resource<List<UserReviewDomainModel>>> = flow {
        emit(Resource.Loading)

        // 1. Load local Room cache first
        try {
            val cachedEntity = cacheDao.getCache(CACHE_KEY)
            if (cachedEntity != null && cachedEntity.payload.isNotBlank()) {
                val cachedDtos = json.decodeFromString<List<ReviewDto>>(cachedEntity.payload)
                val domainList = cachedDtos.map { dtoToDomain(it) }
                if (domainList.isNotEmpty()) {
                    emit(Resource.Success(domainList))
                }
            }
        } catch (e: Exception) {
            // Ignore cache parse error
        }

        // 2. Fetch fresh network data
        try {
            val response = apiService.getMyReviews(page = page, pageSize = pageSize)
            if (response.isSuccessful && response.body() != null) {
                val dtos = response.body()!!.listItems
                val domainList = dtos.map { dtoToDomain(it) }

                // Save to Room cache
                try {
                    val encodedJson = json.encodeToString(dtos)
                    cacheDao.insertCache(
                        CacheEntity(
                            key = CACHE_KEY,
                            payload = encodedJson,
                            timestamp = System.currentTimeMillis()
                        )
                    )
                } catch (e: Exception) {
                    // Ignore cache write error
                }

                emit(Resource.Success(domainList))
            } else {
                val errorMsg = response.message().ifEmpty { "Failed to load user reviews." }
                emit(Resource.Error(errorMsg))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.localizedMessage ?: "Network error. Please check your connection."))
        }
    }

    suspend fun deleteReview(reviewUuid: String): Resource<Unit> {
        return try {
            val response = apiService.deleteReview(reviewUuid)
            if (response.isSuccessful) {
                Resource.Success(Unit)
            } else {
                Resource.Error(response.message().ifEmpty { "Could not delete review." })
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Failed to delete review.")
        }
    }

    suspend fun updateReview(reviewUuid: String, rating: Float, title: String?, comment: String): Resource<UserReviewDomainModel> {
        return try {
            val body = ReviewCreateDto(rating = rating, title = title, comment = comment)
            val response = apiService.updateReview(reviewUuid, body)
            val data = response.body()?.data
            if (response.isSuccessful && data != null) {
                Resource.Success(dtoToDomain(data))
            } else {
                Resource.Error(response.message().ifEmpty { "Could not update review." })
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Failed to update review.")
        }
    }

    private fun dtoToDomain(dto: ReviewDto): UserReviewDomainModel {
        val p = dto.place
        return UserReviewDomainModel(
            reviewUuid = (dto.uuid ?: dto.id ?: "").ifEmpty { dto.id ?: "" },
            placeUuid = p?.uuid ?: dto.placeId ?: "",
            placeSlug = p?.slug ?: p?.uuid ?: dto.placeId ?: "",
            placeName = p?.name ?: "Tourist Attraction",
            placeCategory = p?.category ?: "Destination",
            city = p?.city ?: "",
            district = p?.district ?: p?.city ?: "",
            state = p?.state ?: "",
            country = p?.country ?: "India",
            coverImage = p?.coverImage ?: "",
            placeRating = p?.rating ?: 4.5f,
            rating = dto.rating?.toInt()?.coerceIn(1, 5) ?: 5,
            title = dto.title ?: "",
            comment = dto.comment ?: "",
            createdAt = dto.createdAt ?: "",
            updatedAt = dto.updatedAt,
            likes = dto.likes ?: 0,
            helpfulCount = dto.helpfulCount ?: 0,
            photos = dto.photos ?: emptyList()
        )
    }
}
