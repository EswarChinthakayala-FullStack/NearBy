package com.example.nearby.presentation.itinerary

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.domain.repository.ItineraryRepository
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
class ItineraryViewModel @Inject constructor(
    private val itineraryRepository: ItineraryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ItineraryUiState())
    val uiState: StateFlow<ItineraryUiState> = _uiState.asStateFlow()

    private val _effectFlow = MutableSharedFlow<ItineraryEffect>()
    val effectFlow: SharedFlow<ItineraryEffect> = _effectFlow.asSharedFlow()

    init {
        loadUserItineraries()
    }

    fun onEvent(event: ItineraryEvent) {
        when (event) {
            is ItineraryEvent.OnSearchQueryChanged -> {
                _uiState.update { it.copy(searchQuery = event.query) }
                applyFilters()
            }
            is ItineraryEvent.OnCategorySelected -> {
                _uiState.update { it.copy(selectedCategory = event.category) }
                applyFilters()
            }
            is ItineraryEvent.OnDeleteItinerary -> deleteItinerary(event.id)
            is ItineraryEvent.OnDuplicateItinerary -> duplicateItinerary(event.id)
            is ItineraryEvent.OnRegenerateItinerary -> regenerateItinerary(event.id)
            ItineraryEvent.Refresh -> loadUserItineraries()
        }
    }

    fun loadUserItineraries() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            when (val result = itineraryRepository.getUserItineraries()) {
                is ApiResult.Success -> {
                    val list = result.data
                    _uiState.update { it.copy(isLoading = false, itineraries = list) }
                    applyFilters()
                }
                is ApiResult.ValidationError -> _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
                is ApiResult.NetworkError -> _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
                is ApiResult.ServerError -> _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
                is ApiResult.Unauthorized -> _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
                is ApiResult.Forbidden -> _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
                is ApiResult.UnknownError -> _uiState.update { it.copy(isLoading = false, errorMessage = result.throwable.localizedMessage ?: "Unknown error") }
                ApiResult.Empty -> _uiState.update { it.copy(isLoading = false, itineraries = emptyList()) }
                ApiResult.Loading -> _uiState.update { it.copy(isLoading = true) }
            }
        }
    }

    private fun applyFilters() {
        val query = _uiState.value.searchQuery.lowercase().trim()
        val category = _uiState.value.selectedCategory

        val filtered = _uiState.value.itineraries.filter { item ->
            val matchesQuery = query.isEmpty() ||
                item.destination.lowercase().contains(query) ||
                item.title.lowercase().contains(query) ||
                (item.originalPrompt?.lowercase()?.contains(query) == true) ||
                (item.theme?.lowercase()?.contains(query) == true)

            val matchesCategory = category == "All" || category == "Recent" ||
                item.title.lowercase().contains(category.lowercase()) ||
                item.destination.lowercase().contains(category.lowercase()) ||
                (item.theme?.lowercase()?.contains(category.lowercase()) == true)

            matchesQuery && matchesCategory
        }

        _uiState.update { it.copy(filteredItineraries = filtered) }
    }

    private fun deleteItinerary(id: String) {
        viewModelScope.launch {
            when (val res = itineraryRepository.deleteItinerary(id)) {
                is ApiResult.Success -> {
                    _effectFlow.emit(ItineraryEffect.ShowToast("Itinerary deleted."))
                    loadUserItineraries()
                }
                is ApiResult.ValidationError -> _effectFlow.emit(ItineraryEffect.ShowToast(res.message))
                is ApiResult.NetworkError -> _effectFlow.emit(ItineraryEffect.ShowToast(res.message))
                is ApiResult.ServerError -> _effectFlow.emit(ItineraryEffect.ShowToast(res.message))
                else -> _effectFlow.emit(ItineraryEffect.ShowToast("Failed to delete itinerary."))
            }
        }
    }

    private fun duplicateItinerary(id: String) {
        viewModelScope.launch {
            when (val res = itineraryRepository.duplicateItinerary(id)) {
                is ApiResult.Success -> {
                    _effectFlow.emit(ItineraryEffect.ShowToast("Itinerary duplicated."))
                    loadUserItineraries()
                }
                is ApiResult.ValidationError -> _effectFlow.emit(ItineraryEffect.ShowToast(res.message))
                is ApiResult.NetworkError -> _effectFlow.emit(ItineraryEffect.ShowToast(res.message))
                is ApiResult.ServerError -> _effectFlow.emit(ItineraryEffect.ShowToast(res.message))
                else -> _effectFlow.emit(ItineraryEffect.ShowToast("Failed to duplicate itinerary."))
            }
        }
    }

    private fun regenerateItinerary(id: String) {
        viewModelScope.launch {
            _effectFlow.emit(ItineraryEffect.ShowToast("Regenerating itinerary with AI..."))
            when (val res = itineraryRepository.regenerateItinerary(id)) {
                is ApiResult.Success -> {
                    _effectFlow.emit(ItineraryEffect.ShowToast("Itinerary regenerated!"))
                    loadUserItineraries()
                }
                is ApiResult.ValidationError -> _effectFlow.emit(ItineraryEffect.ShowToast(res.message))
                is ApiResult.NetworkError -> _effectFlow.emit(ItineraryEffect.ShowToast(res.message))
                is ApiResult.ServerError -> _effectFlow.emit(ItineraryEffect.ShowToast(res.message))
                else -> _effectFlow.emit(ItineraryEffect.ShowToast("Failed to regenerate itinerary."))
            }
        }
    }
}
