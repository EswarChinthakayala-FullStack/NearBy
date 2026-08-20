package com.example.nearby.presentation.navigation

import com.example.nearby.presentation.home.PlaceItem
import org.maplibre.android.geometry.LatLng

data class RouteStepItem(
    val id: String,
    val instruction: String,
    val distanceText: String,
    val durationText: String,
    val iconRes: Int
)

data class NavigationDestinationModel(
    val id: String = "",
    val name: String = "",
    val category: String = "",
    val rating: String = "4.5",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val heroImageUrl: String = ""
)

data class NavigationUiState(
    val isLoading: Boolean = true,
    val loadingMessage: String = "Preparing your route...",
    val destination: NavigationDestinationModel? = null,
    val userLocation: LatLng? = null,
    val isLocationPermissionGranted: Boolean = false,
    val isRouteCalculated: Boolean = false,
    val distanceKm: Double = 0.0,
    val durationMinutes: Int = 0,
    val arrivalTimeStr: String = "",
    val travelMode: String = "Drive",
    val routeWaypoints: List<LatLng> = emptyList(),
    val routeSteps: List<RouteStepItem> = emptyList(),
    val nearbyAttractions: List<PlaceItem> = emptyList(),
    val errorMessage: String? = null
)
