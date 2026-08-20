package com.tourismguide.app.domain.usecase

import com.tourismguide.app.common.base.Resource
import com.tourismguide.app.domain.model.PlaceListItem
import com.tourismguide.app.domain.repository.PlacesRepository
import javax.inject.Inject

class GetNearbyPlacesUseCase @Inject constructor(
    private val placesRepository: PlacesRepository
) {
    suspend operator fun invoke(lat: Double, lng: Double, radiusKm: Double = 10.0): Resource<List<PlaceListItem>> {
        return placesRepository.getNearbyPlaces(lat, lng, radiusKm)
    }
}
