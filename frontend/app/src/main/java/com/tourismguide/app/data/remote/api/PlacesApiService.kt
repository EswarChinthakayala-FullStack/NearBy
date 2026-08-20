package com.tourismguide.app.data.remote.api

import com.tourismguide.app.data.remote.dto.ApiResponseDto
import com.tourismguide.app.data.remote.dto.PaginatedResponseDto
import com.tourismguide.app.data.remote.dto.PlaceDto
import com.tourismguide.app.data.remote.dto.PlaceListItemDto
import com.tourismguide.app.data.remote.dto.PlacePhotoDto
import com.tourismguide.app.data.remote.dto.WikipediaDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface PlacesApiService {

    @GET("places/nearby")
    suspend fun getNearbyPlaces(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("radius_km") radiusKm: Double = 10.0
    ): Response<ApiResponseDto<List<PlaceListItemDto>>>

    @GET("places/search")
    suspend fun searchPlaces(
        @Query("q") query: String,
        @Query("category") category: String? = null,
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 20
    ): Response<ApiResponseDto<PaginatedResponseDto<PlaceListItemDto>>>

    @GET("places/{id}")
    suspend fun getPlaceDetail(
        @Path("id") placeId: String
    ): Response<ApiResponseDto<PlaceDto>>

    @GET("places/{id}/wikipedia")
    suspend fun getPlaceWikipedia(
        @Path("id") placeId: String
    ): Response<ApiResponseDto<WikipediaDto>>

    @GET("places/{identifier}/photos")
    suspend fun getPlacePhotos(
        @Path("identifier") identifier: String,
        @Query("limit") limit: Int = 30,
        @Query("offset") offset: Int = 0
    ): Response<ApiResponseDto<List<PlacePhotoDto>>>

    @retrofit2.http.POST("explore/search")
    suspend fun exploreSearch(
        @retrofit2.http.Body request: ExploreSearchRequestDto
    ): Response<ApiResponseDto<ExploreSearchResponseDto>>
}

@kotlinx.serialization.Serializable
data class ExploreSearchFiltersDto(
    @kotlinx.serialization.SerialName("distance") val distance: String? = null,
    @kotlinx.serialization.SerialName("categories") val categories: List<String>? = null,
    @kotlinx.serialization.SerialName("rating") val rating: String? = null,
    @kotlinx.serialization.SerialName("price") val price: String? = null,
    @kotlinx.serialization.SerialName("open_status") val openStatus: Boolean = false,
    @kotlinx.serialization.SerialName("accessibility") val accessibility: List<String>? = null,
    @kotlinx.serialization.SerialName("travel_time") val travelTime: Int? = null,
    @kotlinx.serialization.SerialName("entry_fee") val entryFee: String? = null,
    @kotlinx.serialization.SerialName("crowd_level") val crowdLevel: String? = null
)

@kotlinx.serialization.Serializable
data class ExploreSearchRequestDto(
    @kotlinx.serialization.SerialName("query") val query: String? = null,
    @kotlinx.serialization.SerialName("latitude") val latitude: Double,
    @kotlinx.serialization.SerialName("longitude") val longitude: Double,
    @kotlinx.serialization.SerialName("filters") val filters: ExploreSearchFiltersDto? = null,
    @kotlinx.serialization.SerialName("sort_by") val sortBy: String? = "Relevance",
    @kotlinx.serialization.SerialName("page") val page: Int = 1,
    @kotlinx.serialization.SerialName("page_size") val pageSize: Int = 20
)

@kotlinx.serialization.Serializable
data class ExploreSearchItemDto(
    @kotlinx.serialization.SerialName("id") val id: String,
    @kotlinx.serialization.SerialName("uuid") val uuid: String,
    @kotlinx.serialization.SerialName("name") val name: String,
    @kotlinx.serialization.SerialName("slug") val slug: String,
    @kotlinx.serialization.SerialName("category") val category: String,
    @kotlinx.serialization.SerialName("distance_km") val distanceKm: Double,
    @kotlinx.serialization.SerialName("distance_formatted") val distanceFormatted: String,
    @kotlinx.serialization.SerialName("rating_formatted") val ratingFormatted: String,
    @kotlinx.serialization.SerialName("open_status") val openStatus: String,
    @kotlinx.serialization.SerialName("imageUrl") val imageUrl: String,
    @kotlinx.serialization.SerialName("city") val city: String,
    @kotlinx.serialization.SerialName("state") val state: String,
    @kotlinx.serialization.SerialName("country") val country: String,
    @kotlinx.serialization.SerialName("review_count") val reviewCount: Int,
    @kotlinx.serialization.SerialName("avg_rating") val avgRating: Double,
    @kotlinx.serialization.SerialName("is_favorite") val isFavorite: Boolean = false,
    @kotlinx.serialization.SerialName("recommendation_reason") val recommendationReason: String? = null
)

@kotlinx.serialization.Serializable
data class ExploreSearchResponseDto(
    @kotlinx.serialization.SerialName("items") val items: List<ExploreSearchItemDto> = emptyList(),
    @kotlinx.serialization.SerialName("total") val total: Int = 0,
    @kotlinx.serialization.SerialName("page") val page: Int = 1,
    @kotlinx.serialization.SerialName("page_size") val pageSize: Int = 20,
    @kotlinx.serialization.SerialName("total_pages") val totalPages: Int = 0,
    @kotlinx.serialization.SerialName("summary") val summary: String = "",
    @kotlinx.serialization.SerialName("suggested_tags") val suggestedTags: List<String> = emptyList()
)
