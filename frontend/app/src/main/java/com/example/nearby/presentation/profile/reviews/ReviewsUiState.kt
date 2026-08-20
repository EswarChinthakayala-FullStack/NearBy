package com.example.nearby.presentation.profile.reviews

import com.example.nearby.presentation.profile.reviews.model.UserReviewDomainModel

data class ReviewsFilterState(
    val sortBy: String = "Newest", // Newest, Oldest, Highest Rating, Lowest Rating
    val selectedCategory: String = "All", // All, Temple, Restaurant, Museum, Nature, Adventure
    val withPhotosOnly: Boolean = false,
    val selectedRating: Int = 0 // 0=All, 5=5 Stars, 4=4 Stars, etc.
)

data class ReviewsStatistics(
    val totalReviews: Int = 0,
    val averageRating: Float = 0.0f,
    val totalHelpfulVotes: Int = 0,
    val totalPhotosUploaded: Int = 0
)

data class ReviewsUiState(
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val errorMessage: String? = null,
    val reviews: List<UserReviewDomainModel> = emptyList(),
    val filteredReviews: List<UserReviewDomainModel> = emptyList(),
    val statistics: ReviewsStatistics = ReviewsStatistics(),
    val searchQuery: String = "",
    val filterState: ReviewsFilterState = ReviewsFilterState(),
    val categories: List<String> = listOf("All", "Temple", "Restaurant", "Museum", "Nature", "Adventure")
)

sealed interface ReviewsEvent {
    object Refresh : ReviewsEvent
    data class SearchQueryChanged(val query: String) : ReviewsEvent
    data class CategorySelected(val category: String) : ReviewsEvent
    data class ApplyFilters(val filterState: ReviewsFilterState) : ReviewsEvent
    object ResetFilters : ReviewsEvent
    data class ToggleExpandReview(val reviewUuid: String) : ReviewsEvent
    data class ExecuteDeleteReview(val review: UserReviewDomainModel) : ReviewsEvent
    data class SaveEditedReview(val reviewUuid: String, val rating: Float, val title: String?, val comment: String) : ReviewsEvent
}

sealed interface ReviewsEffect {
    data class ShowToast(val title: String, val message: String, val type: ToastType) : ReviewsEffect
    data class NavigateToPlaceDetail(val placeSlug: String) : ReviewsEffect

    enum class ToastType { SUCCESS, ERROR, INFO }
}
