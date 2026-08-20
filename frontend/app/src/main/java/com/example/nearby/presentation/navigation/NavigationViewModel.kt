package com.example.nearby.presentation.navigation

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.presentation.home.PlaceItem
import com.tourismguide.app.data.remote.api.PlacesApiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.maplibre.android.geometry.LatLng
import javax.inject.Inject

@HiltViewModel
class NavigationViewModel @Inject constructor(
    private val routeManager: NavigationRouteManager,
    private val locationManager: NavigationLocationManager,
    private val permissionManager: NavigationPermissionManager,
    private val placesApiService: PlacesApiService,
    private val favoriteManager: com.example.nearby.presentation.favorites.FavoriteManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(NavigationUiState())
    val uiState: StateFlow<NavigationUiState> = _uiState.asStateFlow()

    private val _effectFlow = MutableSharedFlow<NavigationEffect>()
    val effectFlow: SharedFlow<NavigationEffect> = _effectFlow.asSharedFlow()

    init {
        viewModelScope.launch {
            favoriteManager.favoriteSlugs.collect { favSlugs ->
                _uiState.update { state ->
                    val updated = state.nearbyAttractions.map { 
                        it.copy(isFavorite = favSlugs.contains(it.slug))
                    }
                    state.copy(nearbyAttractions = updated)
                }
            }
        }
    }

    fun initializeNavigation(
        context: Context,
        placeId: String,
        name: String,
        category: String,
        rating: String,
        destLat: Double,
        destLng: Double,
        heroImage: String
    ) {
        val destModel = NavigationDestinationModel(
            id = placeId,
            name = name.ifEmpty { "Destination" },
            category = category.ifEmpty { "Historical" },
            rating = rating.ifEmpty { "4.5" },
            latitude = destLat,
            longitude = destLng,
            heroImageUrl = heroImage
        )
        _uiState.update { it.copy(destination = destModel, isLoading = true) }

        val hasPerm = permissionManager.isPermissionGranted(context)
        _uiState.update { it.copy(isLocationPermissionGranted = hasPerm) }

        startLoadingMessageRotator()

        viewModelScope.launch {
            _uiState.update { it.copy(loadingMessage = "Finding your current location...") }
            val userPos = locationManager.getInitialUserLocation(context)
            _uiState.update { it.copy(userLocation = userPos) }

            if (destLat != 0.0 && destLng != 0.0) {
                calculateDrivingRoute(userPos.latitude, userPos.longitude, destLat, destLng)
                fetchNearbyAttractions(destLat, destLng)
            }
        }
    }

    private fun startLoadingMessageRotator() {
        viewModelScope.launch {
            val messages = listOf(
                "Preparing your route...",
                "Finding your current location...",
                "Calculating the fastest route...",
                "Loading map tiles...",
                "Almost ready..."
            )
            var index = 0
            while (_uiState.value.isLoading) {
                _uiState.update { it.copy(loadingMessage = messages[index % messages.size]) }
                index++
                delay(800)
            }
        }
    }

    private fun calculateDrivingRoute(originLat: Double, originLng: Double, destLat: Double, destLng: Double) {
        viewModelScope.launch {
            _uiState.update { it.copy(loadingMessage = "Calculating the fastest route...") }

            val result = routeManager.calculateRoute(originLat, originLng, destLat, destLng)

            _uiState.update {
                it.copy(
                    isLoading = false,
                    isRouteCalculated = true,
                    distanceKm = result.distanceKm,
                    durationMinutes = result.durationMinutes,
                    arrivalTimeStr = "Arrive in ${result.durationMinutes} mins",
                    routeWaypoints = result.waypoints,
                    routeSteps = result.steps
                )
            }

            _effectFlow.emit(NavigationEffect.AnimateCameraToBounds(result.waypoints, 120))
        }
    }

    private fun fetchNearbyAttractions(lat: Double, lng: Double) {
        viewModelScope.launch {
            try {
                val res = placesApiService.getNearbyPlaces(lat, lng, 10.0)
                val items = res.body()?.data?.take(5)?.map { dto ->
                    PlaceItem(
                        id = dto.uuid,
                        name = dto.name.ifEmpty { "Attraction" },
                        category = dto.category,
                        distance = dto.city ?: "Delhi",
                        rating = if (dto.avgRating > 0) String.format("%.1f", dto.avgRating) else "4.5",
                        openStatus = "Open Now",
                        isFavorite = favoriteManager.favoriteSlugs.value.contains(dto.slug),
                        imageUrl = dto.coverImageUrl ?: "",
                        slug = dto.slug,
                        uuid = dto.uuid
                    )
                } ?: emptyList()
                _uiState.update { it.copy(nearbyAttractions = items) }
            } catch (e: Exception) {
                Log.w("NavigationVM", "Nearby attractions fetch note: ${e.message}")
            }
        }
    }

    fun onEvent(event: NavigationEvent) {
        when (event) {
            is NavigationEvent.RecenterCameraClicked -> {
                val waypoints = _uiState.value.routeWaypoints
                if (waypoints.isNotEmpty()) {
                    viewModelScope.launch {
                        _effectFlow.emit(NavigationEffect.AnimateCameraToBounds(waypoints, 120))
                    }
                }
            }
            is NavigationEvent.StartNavigationClicked -> {
                val dest = _uiState.value.destination
                if (dest != null && dest.latitude != 0.0 && dest.longitude != 0.0) {
                    viewModelScope.launch {
                        _effectFlow.emit(NavigationEffect.LaunchExternalNavigation(dest.latitude, dest.longitude, dest.name))
                    }
                } else {
                    viewModelScope.launch {
                        _effectFlow.emit(NavigationEffect.ShowToast("Turn-by-Turn Guidance", "Following Emerald navigation route."))
                    }
                }
            }
            is NavigationEvent.ModeChanged -> {
                _uiState.update { it.copy(travelMode = event.newMode) }
            }
            is NavigationEvent.ToggleFavorite -> {
                favoriteManager.toggleFavorite(event.slug)
            }
        }
    }
}
