package com.example.nearby.presentation.map

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.presentation.home.PlaceItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NearbyViewModel @Inject constructor() : ViewModel() {

    private val _uiState = MutableStateFlow(NearbyUiState())
    val uiState: StateFlow<NearbyUiState> = _uiState.asStateFlow()

    private val _effectFlow = MutableSharedFlow<NearbyEffect>()
    val effectFlow: SharedFlow<NearbyEffect> = _effectFlow.asSharedFlow()

    init {
        loadNearbyPlaces()
    }

    fun loadNearbyPlaces() {
        val mockPlaces = listOf(
            PlaceItem("1", "Emerald Beach Cove", "Beaches", "1.2 km", "4.9", "Open Now"),
            PlaceItem("2", "Temple Hill Sanctuary", "Heritage", "5.1 km", "4.8", "Open Now"),
            PlaceItem("3", "Sunset Point Lookout", "Viewpoints", "8.2 km", "4.7", "Closes 8 PM"),
            PlaceItem("4", "Marina Bay Walkway", "Waterfront", "1.2 km", "4.7", "Open 24 Hours")
        )
        _uiState.update { it.copy(places = mockPlaces, selectedPlace = mockPlaces.firstOrNull()) }
    }

    fun selectPlace(place: PlaceItem) {
        _uiState.update { it.copy(selectedPlace = place) }
        viewModelScope.launch {
            _effectFlow.emit(NearbyEffect.AnimateCameraTo(13.0827, 80.2707))
        }
    }

    fun setMapStyle(style: MapStyle) {
        _uiState.update { it.copy(currentMapStyle = style) }
    }
}
