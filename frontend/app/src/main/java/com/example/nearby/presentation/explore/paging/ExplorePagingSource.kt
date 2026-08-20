package com.example.nearby.presentation.explore.paging

import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.example.nearby.presentation.home.PlaceItem
import com.tourismguide.app.data.remote.api.ExploreSearchFiltersDto
import com.tourismguide.app.data.remote.api.ExploreSearchRequestDto
import com.tourismguide.app.data.remote.api.PlacesApiService
import com.tourismguide.app.data.remote.api.ExploreSearchItemDto

class ExplorePagingSource(
    private val placesApiService: PlacesApiService,
    private val query: String?,
    private val latitude: Double,
    private val longitude: Double,
    private val filters: ExploreSearchFiltersDto?,
    private val sortBy: String
) : PagingSource<Int, PlaceItem>() {

    override fun getRefreshKey(state: PagingState<Int, PlaceItem>): Int? {
        return state.anchorPosition?.let { anchorPosition ->
            state.closestPageToPosition(anchorPosition)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(anchorPosition)?.nextKey?.minus(1)
        }
    }

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, PlaceItem> {
        val page = params.key ?: 1
        return try {
            val request = ExploreSearchRequestDto(
                query = query,
                latitude = latitude,
                longitude = longitude,
                filters = filters,
                sortBy = sortBy,
                page = page,
                pageSize = params.loadSize
            )
            val response = placesApiService.exploreSearch(request)

            if (response.isSuccessful && response.body()?.data != null) {
                val data = response.body()!!.data!!
                val domainItems = data.items.map { it.toDomainPlaceItem() }

                val hasMore = page < data.totalPages
                val prevKey = if (page == 1) null else page - 1
                val nextKey = if (domainItems.isEmpty() || !hasMore) null else page + 1

                LoadResult.Page(
                    data = domainItems,
                    prevKey = prevKey,
                    nextKey = nextKey
                )
            } else {
                LoadResult.Error(Exception("API call returned failure: ${response.code()}"))
            }
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }

    private fun ExploreSearchItemDto.toDomainPlaceItem(): PlaceItem {
        return PlaceItem(
            id = id,
            name = name,
            category = category,
            distance = distanceFormatted,
            rating = ratingFormatted,
            openStatus = openStatus,
            isFavorite = isFavorite,
            imageUrl = imageUrl,
            uuid = uuid,
            slug = slug,
            city = city,
            state = state,
            country = country,
            reviewCount = reviewCount,
            recommendationReason = recommendationReason
        )
    }
}
