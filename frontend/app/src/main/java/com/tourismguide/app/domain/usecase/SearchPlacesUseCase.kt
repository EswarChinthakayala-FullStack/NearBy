package com.tourismguide.app.domain.usecase

import com.tourismguide.app.common.base.Resource
import com.tourismguide.app.domain.model.DirectionsResult
import com.tourismguide.app.domain.model.Place
import com.tourismguide.app.domain.model.PlaceListItem
import com.tourismguide.app.domain.model.Review
import com.tourismguide.app.domain.repository.DirectionsRepository
import com.tourismguide.app.domain.repository.FavoritesRepository
import com.tourismguide.app.domain.repository.PlacesRepository
import com.tourismguide.app.domain.repository.ReviewsRepository
import com.tourismguide.app.domain.repository.SearchRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class SearchPlacesUseCase @Inject constructor(
    private val searchRepository: SearchRepository
) {
    operator fun invoke(query: String, category: String? = null): Flow<Resource<List<PlaceListItem>>> {
        return searchRepository.searchPlaces(query, category)
    }
}

class GetPlaceDetailsUseCase @Inject constructor(
    private val placesRepository: PlacesRepository
) {
    suspend operator fun invoke(placeId: String): Resource<Place> {
        return placesRepository.getPlaceDetail(placeId)
    }
}

class ToggleFavoriteUseCase @Inject constructor(
    private val favoritesRepository: FavoritesRepository
) {
    suspend operator fun invoke(placeId: String): Resource<Boolean> {
        return favoritesRepository.toggleFavorite(placeId)
    }
}

class SubmitReviewUseCase @Inject constructor(
    private val reviewsRepository: ReviewsRepository
) {
    suspend operator fun invoke(placeId: String, rating: Double, comment: String): Resource<Review> {
        if (comment.isBlank()) {
            return Resource.Error("Comment cannot be empty.")
        }
        return reviewsRepository.submitReview(placeId, rating, comment)
    }
}

class GetDirectionsUseCase @Inject constructor(
    private val directionsRepository: DirectionsRepository
) {
    suspend operator fun invoke(originLat: Double, originLng: Double, destLat: Double, destLng: Double): Resource<DirectionsResult> {
        return directionsRepository.getDirections(originLat, originLng, destLat, destLng)
    }
}
