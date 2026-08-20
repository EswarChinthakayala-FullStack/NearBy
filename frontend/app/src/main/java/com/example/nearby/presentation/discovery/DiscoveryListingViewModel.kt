package com.example.nearby.presentation.discovery

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.presentation.home.PlaceItem
import com.tourismguide.app.data.remote.api.HomeApiService
import com.tourismguide.app.data.remote.dto.HomePlaceDto
import com.tourismguide.app.data.remote.dto.PaginatedResponseDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DiscoveryListingViewModel @Inject constructor(
    private val homeApiService: HomeApiService,
    private val favoriteManager: com.example.nearby.presentation.favorites.FavoriteManager
) : ViewModel() {

    init {
        viewModelScope.launch {
            favoriteManager.favoriteSlugs.collect { favSlugs ->
                val current = _places.value
                if (current.isNotEmpty()) {
                    _places.value = current.map { it.copy(isFavorite = favSlugs.contains(it.slug)) }
                }
            }
        }
    }

    private val _places = MutableStateFlow<List<PlaceItem>>(emptyList())
    val places: StateFlow<List<PlaceItem>> = _places.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private var currentPage = 1
    private var isLastPage = false
    private var isFetchingNextPage = false

    private var currentLat = 0.0
    private var currentLng = 0.0
    private var currentType = "trending"

    // Filter states
    var searchQuery = ""
    var selectedCategory: String? = null
    var minRating: Float? = null
    var openNowOnly = false
    var sortBy: String? = null

    fun init(type: String, lat: Double, lng: Double) {
        currentType = type
        currentLat = lat
        currentLng = lng
        loadData(isRefresh = true)
    }

    fun loadData(isRefresh: Boolean = false) {
        if (isRefresh) {
            currentPage = 1
            isLastPage = false
            _error.value = null
            if (_places.value.isEmpty()) {
                _isLoading.value = true
            } else {
                _isRefreshing.value = true
            }
        } else {
            if (isLastPage || isFetchingNextPage) return
            isFetchingNextPage = true
        }

        viewModelScope.launch {
            try {
                val response = when (currentType) {
                    "trending" -> homeApiService.getTrending(
                        latitude = currentLat,
                        longitude = currentLng,
                        page = currentPage,
                        pageSize = 20,
                        query = searchQuery.ifBlank { null },
                        category = selectedCategory,
                        minRating = minRating,
                        openNow = if (openNowOnly) true else null,
                        sortBy = sortBy
                    )
                    "nearby" -> homeApiService.getNearby(
                        latitude = currentLat,
                        longitude = currentLng,
                        page = currentPage,
                        pageSize = 20,
                        query = searchQuery.ifBlank { null },
                        category = selectedCategory,
                        minRating = minRating,
                        openNow = if (openNowOnly) true else null,
                        sortBy = sortBy
                    )
                    "recommended" -> homeApiService.getRecommended(
                        latitude = currentLat,
                        longitude = currentLng,
                        page = currentPage,
                        pageSize = 20,
                        query = searchQuery.ifBlank { null },
                        category = selectedCategory,
                        minRating = minRating,
                        openNow = if (openNowOnly) true else null,
                        sortBy = sortBy
                    )
                    "popular" -> homeApiService.getPopular(
                        latitude = currentLat,
                        longitude = currentLng,
                        page = currentPage,
                        pageSize = 20,
                        query = searchQuery.ifBlank { null },
                        category = selectedCategory,
                        minRating = minRating,
                        openNow = if (openNowOnly) true else null,
                        sortBy = sortBy
                    )
                    else -> throw IllegalArgumentException("Unknown type: $currentType")
                }

                if (response.isSuccessful && response.body()?.data != null) {
                    val envelope = response.body()!!
                    val newItems = mapPlaceDtos(envelope.data)

                    if (isRefresh) {
                        _places.value = newItems
                    } else {
                        _places.value = _places.value + newItems
                    }

                    val totalPages = envelope.pagination?.totalPages ?: 1
                    val currentPageNum = envelope.pagination?.page ?: 1
                    isLastPage = newItems.size < 20 || currentPageNum >= totalPages
                    currentPage++
                } else {
                    _error.value = "Failed to load places: ${response.message()}"
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _error.value = "Network error: ${e.message}"
            } finally {
                _isLoading.value = false
                _isRefreshing.value = false
                isFetchingNextPage = false
            }
        }
    }

    fun toggleFavorite(place: PlaceItem) {
        favoriteManager.toggleFavorite(place.slug)
    }

    private fun mapPlaceDtos(dtos: List<HomePlaceDto>): List<PlaceItem> {
        return dtos.map { dto ->
            val cityStr = dto.city.orEmpty()
            val dist = if (dto.distanceKm != null) "${dto.distanceKm} km away" else if (cityStr.isNotBlank()) cityStr else "Nearby"
            val idStr = dto.id ?: ""
            val uuidStr = dto.uuid.orEmpty().ifBlank { idStr }
            val slugStr = dto.slug.orEmpty().ifBlank { "place-$idStr" }
            val isFav = favoriteManager.favoriteSlugs.value.contains(slugStr) || (dto.isFavorite ?: false)
            PlaceItem(
                id = idStr,
                name = dto.name ?: "Attraction",
                category = dto.category ?: "General",
                distance = dist,
                rating = String.format("%.1f", dto.rating ?: 0.0),
                openStatus = dto.openStatus ?: "",
                isFavorite = isFav,
                imageUrl = dto.imageUrl ?: "",
                uuid = uuidStr,
                slug = slugStr,
                city = cityStr,
                state = dto.state ?: "",
                country = dto.country ?: "",
                reviewCount = dto.reviewCount ?: 0,
                recommendationReason = dto.recommendationReason
            )
        }
    }
}
