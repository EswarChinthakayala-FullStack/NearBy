package com.example.nearby.presentation.profile.mytrips

import com.example.nearby.presentation.profile.mytrips.model.TripDomainModel

data class MyTripsFilterState(
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val sortBy: String = "Newest",
    val statusFilter: String = "All"
)

data class MyTripsUiState(
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val allTrips: List<TripDomainModel> = emptyList(),
    val filteredTrips: List<TripDomainModel> = emptyList(),
    val filterState: MyTripsFilterState = MyTripsFilterState(),
    val categories: List<String> = listOf("All", "Cultural", "Heritage", "Adventure", "Nature", "Food", "Family", "Temple"),
    val totalTrips: Int = 0,
    val totalDestinations: Int = 0,
    val totalPlacesPlanned: Int = 0,
    val totalTravelDays: Int = 0,
    val errorMessage: String? = null
)
