package com.example.nearby.presentation.itinerary.details

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto
import com.tourismguide.app.domain.repository.ItineraryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ItineraryDetailUiState(
    val isLoading: Boolean = false,
    val itinerary: ItineraryResponseDto? = null,
    val errorMessage: String? = null
)

@HiltViewModel
class ItineraryDetailViewModel @Inject constructor(
    private val itineraryRepository: ItineraryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ItineraryDetailUiState())
    val uiState: StateFlow<ItineraryDetailUiState> = _uiState.asStateFlow()

    fun loadItinerary(id: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            when (val res = itineraryRepository.getItineraryDetails(id)) {
                is ApiResult.Success -> {
                    _uiState.update { it.copy(isLoading = false, itinerary = res.data) }
                }
                is ApiResult.ValidationError -> _uiState.update { it.copy(isLoading = false, errorMessage = res.message) }
                is ApiResult.NetworkError -> _uiState.update { it.copy(isLoading = false, errorMessage = res.message) }
                is ApiResult.ServerError -> _uiState.update { it.copy(isLoading = false, errorMessage = res.message) }
                else -> _uiState.update { it.copy(isLoading = false, errorMessage = "Failed to load itinerary details.") }
            }
        }
    }

    fun setItineraryData(itinerary: ItineraryResponseDto) {
        _uiState.update { it.copy(isLoading = false, itinerary = itinerary) }
    }
}
