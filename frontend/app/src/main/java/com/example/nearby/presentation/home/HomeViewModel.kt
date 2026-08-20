package com.example.nearby.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.api.DashboardRequestBody
import com.tourismguide.app.data.remote.api.FavoritesApiService
import com.tourismguide.app.data.remote.api.HomeApiService
import com.tourismguide.app.data.remote.datasource.ProfileRemoteDataSource
import com.tourismguide.app.data.remote.dto.HomeCategoryDto
import com.tourismguide.app.data.remote.dto.HomeDashboardDto
import com.tourismguide.app.data.remote.dto.HomePlaceDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Calendar
import javax.inject.Inject

data class PlaceItem(
    val id: String,
    val name: String,
    val category: String,
    val distance: String,
    val rating: String,
    val openStatus: String,
    var isFavorite: Boolean = false,
    val imageUrl: String = "",
    val uuid: String = "",
    val slug: String = "",
    val city: String = "",
    val state: String = "",
    val country: String = "",
    val reviewCount: Int = 0,
    val recommendationReason: String? = null,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)

data class CategoryItem(
    val icon: String,
    val name: String,
    val slug: String = "",
    val count: Int = 0
)

data class BannerItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val imageUrl: String,
    val categorySlug: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val homeApiService: HomeApiService,
    private val favoritesApiService: FavoritesApiService,
    private val profileRemoteDataSource: ProfileRemoteDataSource,
    private val favoriteManager: com.example.nearby.presentation.favorites.FavoriteManager
) : ViewModel() {

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _greetingText = MutableStateFlow(calculateGreeting())
    val greetingText: StateFlow<String> = _greetingText.asStateFlow()

    private val _userName = MutableStateFlow("Traveler")
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _userAvatarUrl = MutableStateFlow<String?>(null)
    val userAvatarUrl: StateFlow<String?> = _userAvatarUrl.asStateFlow()

    private val _locationName = MutableStateFlow("Locating...")
    val locationName: StateFlow<String> = _locationName.asStateFlow()

    private val _categoriesFlow = MutableStateFlow<List<CategoryItem>>(emptyList())
    val categoriesFlow: StateFlow<List<CategoryItem>> = _categoriesFlow.asStateFlow()

    private val _trendingPlacesFlow = MutableStateFlow<List<PlaceItem>>(emptyList())
    val trendingPlacesFlow: StateFlow<List<PlaceItem>> = _trendingPlacesFlow.asStateFlow()

    private val _nearbyPlacesFlow = MutableStateFlow<List<PlaceItem>>(emptyList())
    val nearbyPlacesFlow: StateFlow<List<PlaceItem>> = _nearbyPlacesFlow.asStateFlow()

    private val _recommendedPlacesFlow = MutableStateFlow<List<PlaceItem>>(emptyList())
    val recommendedPlacesFlow: StateFlow<List<PlaceItem>> = _recommendedPlacesFlow.asStateFlow()

    private val _popularPlacesFlow = MutableStateFlow<List<PlaceItem>>(emptyList())
    val popularPlacesFlow: StateFlow<List<PlaceItem>> = _popularPlacesFlow.asStateFlow()

    private val _bannersFlow = MutableStateFlow<List<BannerItem>>(emptyList())
    val bannersFlow: StateFlow<List<BannerItem>> = _bannersFlow.asStateFlow()

    init {
        viewModelScope.launch {
            favoriteManager.favoriteSlugs.collect { favSlugs ->
                val updateFav: (List<PlaceItem>) -> List<PlaceItem> = { list ->
                    list.map { it.copy(isFavorite = favSlugs.contains(it.slug)) }
                }
                _trendingPlacesFlow.update(updateFav)
                _nearbyPlacesFlow.update(updateFav)
                _recommendedPlacesFlow.update(updateFav)
                _popularPlacesFlow.update(updateFav)
            }
        }
    }

    fun loadHomeData(latitude: Double, longitude: Double) {
        _isLoading.value = true
        _greetingText.value = calculateGreeting()

        viewModelScope.launch {
            // 1. Fetch user profile (parallel-safe, no dependency on dashboard)
            launch {
                when (val userRes = profileRemoteDataSource.getProfile()) {
                    is ApiResult.Success -> {
                        val user = userRes.data
                        _userName.value = user.fullName.ifBlank { "Traveler" }
                        _userAvatarUrl.value = user.resolvedAvatarUrl
                    }
                    else -> {}
                }
            }

            // 2. Fetch Dashboard via POST with GPS coordinates
            // The backend performs reverse geocoding, spatial queries, and ranking.
            // No separate reverseGeocode call needed — everything comes from the dashboard.
            try {
                val response = homeApiService.postDashboard(
                    DashboardRequestBody(latitude = latitude, longitude = longitude)
                )
                if (response.isSuccessful && response.body()?.data != null) {
                    val data = response.body()!!.data!!

                    if (!data.userGreeting.isNullOrBlank()) {
                        _greetingText.value = data.userGreeting
                    }

                    if (!data.userName.isNullOrBlank()) {
                        _userName.value = data.userName
                    }

                    if (!data.userAvatar.isNullOrBlank()) {
                        _userAvatarUrl.value = data.userAvatar
                    }

                    // Use the backend-derived location name (reverse-geocoded from GPS)
                    if (!data.locationName.isNullOrBlank()) {
                        _locationName.value = data.locationName
                    }

                    _categoriesFlow.value = data.categories.orEmpty().filterNotNull().map { c ->
                        CategoryItem(c.icon ?: "📍", c.name ?: "Category", c.slug ?: "", c.count ?: 0)
                    }

                    _trendingPlacesFlow.value = mapPlaceDtos(data.trending)
                    _nearbyPlacesFlow.value = mapPlaceDtos(data.nearby)
                    _recommendedPlacesFlow.value = mapPlaceDtos(data.recommended)
                    _popularPlacesFlow.value = mapPlaceDtos(data.popular)

                    _bannersFlow.value = data.banners.orEmpty().filterNotNull().map { b ->
                        BannerItem(
                            b.id ?: "", 
                            b.title ?: "", 
                            b.subtitle ?: "", 
                            b.imageUrl ?: "", 
                            b.categorySlug
                        )
                    }
                } else {
                    _locationName.value = "Location unavailable"
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _locationName.value = "Connection error: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    private fun mapPlaceDtos(dtos: List<HomePlaceDto>?): List<PlaceItem> {
        return dtos.orEmpty().filterNotNull().map { dto ->
            val cityStr = dto.city.orEmpty()
            val dist = if (dto.distanceKm != null) "${dto.distanceKm} km away" else if (cityStr.isNotBlank()) cityStr else "Nearby"
            val idStr = dto.id ?: ""
            val uuidStr = dto.uuid.orEmpty().ifEmpty { idStr }
            val slugStr = dto.slug.orEmpty().ifEmpty { "place-$idStr" }
            PlaceItem(
                id = idStr,
                name = dto.name ?: "Attraction",
                category = dto.category ?: "General",
                distance = dist,
                rating = String.format("%.1f", dto.rating ?: 0.0),
                openStatus = dto.openStatus ?: "",
                isFavorite = dto.isFavorite ?: false,
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

    fun toggleFavorite(placeId: String) {
        val allPlaces = _trendingPlacesFlow.value + _nearbyPlacesFlow.value + _recommendedPlacesFlow.value + _popularPlacesFlow.value
        val place = allPlaces.find { it.id == placeId || it.uuid == placeId }
        val slug = place?.slug ?: placeId
        favoriteManager.toggleFavorite(slug)
    }

    private fun calculateGreeting(): String {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        return when (hour) {
            in 5..11 -> "Good Morning,"
            in 12..16 -> "Good Afternoon,"
            in 17..21 -> "Good Evening,"
            else -> "Good Night,"
        }
    }
}
