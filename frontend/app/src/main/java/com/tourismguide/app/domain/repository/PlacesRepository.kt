package com.tourismguide.app.domain.repository

import com.tourismguide.app.common.base.Resource
import com.tourismguide.app.domain.model.Category
import com.tourismguide.app.domain.model.Place
import com.tourismguide.app.domain.model.PlaceListItem

interface PlacesRepository {
    suspend fun getNearbyPlaces(lat: Double, lng: Double, radiusKm: Double): Resource<List<PlaceListItem>>
    suspend fun searchPlaces(query: String, category: String?): Resource<List<PlaceListItem>>
    suspend fun getPlaceDetail(placeId: String): Resource<Place>
    suspend fun getCategories(): Resource<List<Category>>
}
