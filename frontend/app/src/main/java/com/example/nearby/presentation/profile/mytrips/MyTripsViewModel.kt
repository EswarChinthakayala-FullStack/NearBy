package com.example.nearby.presentation.profile.mytrips

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.dto.ItineraryListItemDto
import com.tourismguide.app.domain.repository.ItineraryRepository
import com.example.nearby.presentation.profile.mytrips.model.TripDomainModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class MyTripsViewModel @Inject constructor(
    private val itineraryRepository: ItineraryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MyTripsUiState())
    val uiState: StateFlow<MyTripsUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    init {
        loadTrips()
    }

    fun loadTrips(isRefreshing: Boolean = false) {
        viewModelScope.launch {
            if (isRefreshing) {
                _uiState.update { it.copy(isRefreshing = true, errorMessage = null) }
            } else {
                _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            }

            when (val result = itineraryRepository.getUserItineraries(page = 1, pageSize = 100)) {
                is ApiResult.Success -> {
                    val domainModels = withContext(Dispatchers.Default) {
                        result.data.map { dtoToDomainModel(it) }
                    }

                    _uiState.update { currentState ->
                        val updatedState = currentState.copy(
                            isLoading = false,
                            isRefreshing = false,
                            allTrips = domainModels
                        )
                        computeFilteredState(updatedState)
                    }
                }
                else -> {
                    val errorMsg = (result as? ApiResult.NetworkError)?.message
                        ?: (result as? ApiResult.ValidationError)?.message
                        ?: "Error loading user itineraries."
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isRefreshing = false,
                            errorMessage = errorMsg
                        )
                    }
                }
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(300) // 300ms debounce
            _uiState.update { state ->
                val newFilter = state.filterState.copy(searchQuery = query.trim())
                computeFilteredState(state.copy(filterState = newFilter))
            }
        }
    }

    fun onCategorySelected(category: String) {
        viewModelScope.launch {
            _uiState.update { state ->
                val newFilter = state.filterState.copy(selectedCategory = category)
                computeFilteredState(state.copy(filterState = newFilter))
            }
        }
    }

    fun onFilterStateChanged(filterState: MyTripsFilterState) {
        viewModelScope.launch {
            _uiState.update { state ->
                computeFilteredState(state.copy(filterState = filterState))
            }
        }
    }

    fun onResetFilters() {
        viewModelScope.launch {
            _uiState.update { state ->
                computeFilteredState(state.copy(filterState = MyTripsFilterState()))
            }
        }
    }

    fun toggleExpandPrompt(trip: TripDomainModel) {
        _uiState.update { state ->
            val updatedAll = state.allTrips.map {
                if (it.uuid == trip.uuid) it.copy(isExpanded = !it.isExpanded) else it
            }
            val updatedFiltered = state.filteredTrips.map {
                if (it.uuid == trip.uuid) it.copy(isExpanded = !it.isExpanded) else it
            }
            state.copy(allTrips = updatedAll, filteredTrips = updatedFiltered)
        }
    }

    fun deleteTrip(trip: TripDomainModel, onDeleted: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            when (val result = itineraryRepository.deleteItinerary(trip.uuid)) {
                is ApiResult.Success -> {
                    _uiState.update { currentState ->
                        val updatedAll = currentState.allTrips.filterNot { it.uuid == trip.uuid }
                        computeFilteredState(currentState.copy(allTrips = updatedAll))
                    }
                    onDeleted(true, "Itinerary deleted successfully.")
                }
                else -> {
                    onDeleted(false, "Failed to delete itinerary.")
                }
            }
        }
    }

    private suspend fun computeFilteredState(state: MyTripsUiState): MyTripsUiState = withContext(Dispatchers.Default) {
        val filter = state.filterState
        var list = state.allTrips

        // 1. Search Query Filter
        if (filter.searchQuery.isNotBlank()) {
            val q = filter.searchQuery.lowercase()
            list = list.filter { trip ->
                trip.destination.lowercase().contains(q) ||
                        trip.title.lowercase().contains(q) ||
                        trip.prompt.lowercase().contains(q) ||
                        trip.theme.lowercase().contains(q)
            }
        }

        // 2. Category / Theme Filter
        if (!filter.selectedCategory.equals("All", ignoreCase = true)) {
            val cat = filter.selectedCategory.lowercase()
            list = list.filter { trip ->
                trip.theme.lowercase().contains(cat) ||
                        (cat == "1 day" && trip.daysCount == 1) ||
                        (cat == "multi-day" && trip.daysCount > 1)
            }
        }

        // 3. Status Filter
        if (!filter.statusFilter.equals("All", ignoreCase = true)) {
            val stat = filter.statusFilter.lowercase()
            list = list.filter { trip ->
                if (stat == "completed") {
                    trip.status.lowercase() == "completed"
                } else {
                    trip.status.lowercase() == "planning" || trip.status.lowercase() == "draft"
                }
            }
        }

        // 4. Sorting
        list = when (filter.sortBy) {
            "Oldest" -> list.sortedBy { it.createdAt }
            "Most Places" -> list.sortedByDescending { it.placesCount }
            "Longest Duration" -> list.sortedByDescending { it.daysCount }
            else -> list.sortedByDescending { it.createdAt } // Newest
        }

        // 5. Calculate Statistics
        val totalTrips = state.allTrips.size
        val uniqueDestinations = state.allTrips.map { it.destination.trim().lowercase() }.filter { it.isNotBlank() }.distinct().size
        val totalPlaces = state.allTrips.sumOf { it.placesCount }
        val totalDays = state.allTrips.sumOf { it.daysCount }

        state.copy(
            filteredTrips = list,
            totalTrips = totalTrips,
            totalDestinations = uniqueDestinations,
            totalPlacesPlanned = totalPlaces,
            totalTravelDays = totalDays
        )
    }

    private fun dtoToDomainModel(dto: ItineraryListItemDto): TripDomainModel {
        val days = dto.totalDays
        val places = dto.totalPlaces
        val distance = if (dto.estimatedDistanceKm > 0) dto.estimatedDistanceKm else (days * 16.5)

        return TripDomainModel(
            uuid = dto.resolvedId,
            destination = dto.destination.ifEmpty { "Explore Destination" },
            title = dto.title.ifEmpty { "$days-Day Itinerary to ${dto.destination}" },
            prompt = dto.prompt,
            theme = dto.resolvedTheme,
            daysCount = days,
            placesCount = places,
            estimatedDistanceKm = distance,
            estimatedDuration = dto.durationLabel,
            weatherTempC = 26.0,
            weatherCondition = "Clear Sky",
            coverImage = dto.coverImage ?: "",
            status = dto.status,
            createdAt = dto.createdAt ?: "",
            updatedAt = dto.updatedAt
        )
    }
}
