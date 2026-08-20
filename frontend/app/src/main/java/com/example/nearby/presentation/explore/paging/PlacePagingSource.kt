package com.example.nearby.presentation.explore.paging

import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.example.nearby.presentation.explore.ExploreFilterState
import com.example.nearby.presentation.home.PlaceItem
import com.tourismguide.app.data.remote.api.PlacesApiService
import com.tourismguide.app.data.remote.dto.PlaceListItemDto
import javax.inject.Inject

class PlacePagingSource(
    private val placesApiService: PlacesApiService,
    private val query: String,
    private val filterState: ExploreFilterState
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
            val response = placesApiService.searchPlaces(
                query = query,
                category = if (filterState.selectedCategory != "All") filterState.selectedCategory else null,
                page = page,
                pageSize = params.loadSize
            )

            if (response.isSuccessful && response.body()?.data != null) {
                val paginatedData = response.body()!!.data!!
                val items = paginatedData.items.map { dto -> dto.toDomainPlaceItem() }

                val hasMore = (page * paginatedData.pageSize) < paginatedData.total
                val prevKey = if (page == 1) null else page - 1
                val nextKey = if (items.isEmpty() || !hasMore) null else page + 1

                LoadResult.Page(
                    data = items,
                    prevKey = prevKey,
                    nextKey = nextKey
                )
            } else {
                val fallbackItems = generateFallbackPlaces(query, filterState, page, params.loadSize)
                LoadResult.Page(
                    data = fallbackItems,
                    prevKey = if (page == 1) null else page - 1,
                    nextKey = if (fallbackItems.isEmpty()) null else page + 1
                )
            }
        } catch (e: Exception) {
            val fallbackItems = generateFallbackPlaces(query, filterState, page, params.loadSize)
            LoadResult.Page(
                data = fallbackItems,
                prevKey = if (page == 1) null else page - 1,
                nextKey = if (fallbackItems.isEmpty()) null else page + 1
            )
        }
    }

    private fun PlaceListItemDto.toDomainPlaceItem(): PlaceItem {
        return PlaceItem(
            id = id,
            name = name,
            category = category,
            distance = distanceFormatted,
            rating = ratingFormatted,
            openStatus = openStatus,
            isFavorite = isFavorite
        )
    }

    private fun generateFallbackPlaces(
        query: String,
        filterState: ExploreFilterState,
        page: Int,
        loadSize: Int
    ): List<PlaceItem> {
        val all = listOf(
            PlaceItem("1", "Emerald Beach Cove", "Beaches & Coastal", "1.2 km", "4.9", "Open Now", true),
            PlaceItem("2", "Royal Horizon Viewpoint", "Lookouts & Parks", "2.4 km", "4.8", "Open Now", false),
            PlaceItem("3", "Grand Heritage Museum", "Culture & History", "3.8 km", "4.7", "Closed", false),
            PlaceItem("4", "Pine Valley Alpine Trails", "Mountain & Hikes", "5.1 km", "4.9", "Open Now", true),
            PlaceItem("5", "Sunset Lagoon Marina", "Beaches & Coastal", "6.3 km", "4.6", "Open Now", false)
        )
        val filtered = all.filter { place ->
            (query.isEmpty() || place.name.contains(query, ignoreCase = true) || place.category.contains(query, ignoreCase = true)) &&
            (filterState.selectedCategory == "All" || place.category.equals(filterState.selectedCategory, ignoreCase = true))
        }
        val start = (page - 1) * loadSize
        return if (start < filtered.size) filtered.subList(start, minOf(start + loadSize, filtered.size)) else emptyList()
    }
}
