package com.example.nearby.presentation.profile.reviews

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.presentation.profile.reviews.data.UserReviewRepository
import com.example.nearby.presentation.profile.reviews.model.UserReviewDomainModel
import com.tourismguide.app.common.base.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@OptIn(FlowPreview::class)
@HiltViewModel
class ReviewsViewModel @Inject constructor(
    private val repository: UserReviewRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ReviewsUiState())
    val uiState: StateFlow<ReviewsUiState> = _uiState.asStateFlow()

    private val _effectFlow = MutableSharedFlow<ReviewsEffect>()
    val effectFlow: SharedFlow<ReviewsEffect> = _effectFlow.asSharedFlow()

    private val searchQueryFlow = MutableStateFlow("")

    init {
        loadUserReviews()

        viewModelScope.launch {
            searchQueryFlow
                .debounce(300)
                .distinctUntilChanged()
                .collect { query ->
                    _uiState.update { it.copy(searchQuery = query) }
                    applyFilterAndSearch()
                }
        }
    }

    fun onEvent(event: ReviewsEvent) {
        when (event) {
            is ReviewsEvent.Refresh -> loadUserReviews(isRefresh = true)
            is ReviewsEvent.SearchQueryChanged -> {
                searchQueryFlow.value = event.query
            }
            is ReviewsEvent.CategorySelected -> {
                _uiState.update { state ->
                    state.copy(filterState = state.filterState.copy(selectedCategory = event.category))
                }
                applyFilterAndSearch()
            }
            is ReviewsEvent.ApplyFilters -> {
                _uiState.update { it.copy(filterState = event.filterState) }
                applyFilterAndSearch()
            }
            is ReviewsEvent.ResetFilters -> {
                _uiState.update { it.copy(filterState = ReviewsFilterState()) }
                applyFilterAndSearch()
            }
            is ReviewsEvent.ToggleExpandReview -> {
                _uiState.update { state ->
                    val updated = state.filteredReviews.map { item ->
                        if (item.reviewUuid == event.reviewUuid) {
                            item.copy(isExpanded = !item.isExpanded)
                        } else item
                    }
                    state.copy(filteredReviews = updated)
                }
            }
            is ReviewsEvent.ExecuteDeleteReview -> executeDeleteReview(event.review)
            is ReviewsEvent.SaveEditedReview -> saveEditedReview(event.reviewUuid, event.rating, event.title, event.comment)
        }
    }

    fun loadUserReviews(isRefresh: Boolean = false) {
        viewModelScope.launch {
            if (isRefresh) {
                _uiState.update { it.copy(isRefreshing = true) }
            } else {
                _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            }

            repository.fetchUserReviews().collect { resource ->
                when (resource) {
                    is Resource.Loading -> {
                        if (!isRefresh) _uiState.update { it.copy(isLoading = true) }
                    }
                    is Resource.Success -> {
                        val list = resource.data
                        val stats = calculateStatistics(list)
                        _uiState.update { state ->
                            state.copy(
                                isLoading = false,
                                isRefreshing = false,
                                reviews = list,
                                statistics = stats,
                                errorMessage = null
                            )
                        }
                        applyFilterAndSearch()
                    }
                    is Resource.Error -> {
                        _uiState.update { state ->
                            state.copy(
                                isLoading = false,
                                isRefreshing = false,
                                errorMessage = if (state.reviews.isEmpty()) resource.message else null
                            )
                        }
                        if (_uiState.value.reviews.isNotEmpty()) {
                            _effectFlow.emit(
                                ReviewsEffect.ShowToast(
                                    title = "Sync Warning",
                                    message = resource.message,
                                    type = ReviewsEffect.ToastType.INFO
                                )
                            )
                        }
                    }
                }
            }
        }
    }

    private fun executeDeleteReview(target: UserReviewDomainModel) {
        viewModelScope.launch {
            // Optimistically update UI
            val currentReviews = _uiState.value.reviews
            val updated = currentReviews.filter { it.reviewUuid != target.reviewUuid }
            val stats = calculateStatistics(updated)
            _uiState.update { it.copy(reviews = updated, statistics = stats) }
            applyFilterAndSearch()

            _effectFlow.emit(ReviewsEffect.ShowToast("Review Deleted", "'${target.title.ifEmpty { target.placeName }}' has been removed.", ReviewsEffect.ToastType.INFO))

            val res = repository.deleteReview(target.reviewUuid)
            if (res is Resource.Error) {
                // Rollback on failure
                val rollbackStats = calculateStatistics(currentReviews)
                _uiState.update { it.copy(reviews = currentReviews, statistics = rollbackStats) }
                applyFilterAndSearch()
                _effectFlow.emit(ReviewsEffect.ShowToast("Delete Failed", res.message, ReviewsEffect.ToastType.ERROR))
            }
        }
    }

    private fun saveEditedReview(reviewUuid: String, rating: Float, title: String?, comment: String) {
        viewModelScope.launch {
            val res = repository.updateReview(reviewUuid, rating, title, comment)
            when (res) {
                is Resource.Success -> {
                    val updatedItem = res.data
                    val currentReviews = _uiState.value.reviews.map { item ->
                        if (item.reviewUuid == reviewUuid) updatedItem else item
                    }
                    val stats = calculateStatistics(currentReviews)
                    _uiState.update { it.copy(reviews = currentReviews, statistics = stats) }
                    applyFilterAndSearch()
                    _effectFlow.emit(ReviewsEffect.ShowToast("Review Updated", "Your review feedback has been updated.", ReviewsEffect.ToastType.SUCCESS))
                }
                is Resource.Error -> {
                    _effectFlow.emit(ReviewsEffect.ShowToast("Update Failed", res.message, ReviewsEffect.ToastType.ERROR))
                }
                else -> {}
            }
        }
    }

    private fun calculateStatistics(list: List<UserReviewDomainModel>): ReviewsStatistics {
        if (list.isEmpty()) return ReviewsStatistics()
        val avgRating = list.map { it.rating }.average().toFloat()
        val totalHelpful = list.sumOf { it.helpfulCount + it.likes }
        val totalPhotos = list.sumOf { it.photos.size }
        return ReviewsStatistics(
            totalReviews = list.size,
            averageRating = (Math.round(avgRating * 10.0f) / 10.0f),
            totalHelpfulVotes = totalHelpful,
            totalPhotosUploaded = totalPhotos
        )
    }

    private fun applyFilterAndSearch() {
        val state = _uiState.value
        var result = state.reviews

        // 1. Search Query Filter
        if (state.searchQuery.isNotBlank()) {
            val q = state.searchQuery.trim().lowercase()
            result = result.filter { item ->
                item.placeName.lowercase().contains(q) ||
                        item.city.lowercase().contains(q) ||
                        item.placeCategory.lowercase().contains(q) ||
                        item.title.lowercase().contains(q) ||
                        item.comment.lowercase().contains(q)
            }
        }

        // 2. Category Filter
        val selCat = state.filterState.selectedCategory
        if (selCat != "All") {
            result = result.filter { it.placeCategory.equals(selCat, ignoreCase = true) }
        }

        // 3. With Photos Filter
        if (state.filterState.withPhotosOnly) {
            result = result.filter { it.photos.isNotEmpty() }
        }

        // 4. Rating Threshold Filter
        if (state.filterState.selectedRating > 0) {
            result = result.filter { it.rating == state.filterState.selectedRating }
        }

        // 5. Sorting
        result = when (state.filterState.sortBy) {
            "Oldest" -> result.sortedBy { it.createdAt }
            "Highest Rating" -> result.sortedByDescending { it.rating }
            "Lowest Rating" -> result.sortedBy { it.rating }
            else -> result.sortedByDescending { it.createdAt } // Newest
        }

        _uiState.update { it.copy(filteredReviews = result) }
    }
}
