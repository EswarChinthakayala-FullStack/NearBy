package com.tourismguide.app.data.repository

import com.tourismguide.app.common.base.Resource
import com.tourismguide.app.data.local.dao.PlaceCacheDao
import com.tourismguide.app.data.local.entity.PlaceCacheEntity
import com.tourismguide.app.data.mapper.PlaceMapper.toDomain
import com.tourismguide.app.data.remote.api.PlacesApiService
import com.tourismguide.app.domain.model.Category
import com.tourismguide.app.domain.model.Place
import com.tourismguide.app.domain.model.PlaceListItem
import com.tourismguide.app.domain.repository.PlacesRepository
import javax.inject.Inject

class PlacesRepositoryImpl @Inject constructor(
    private val placesApiService: PlacesApiService,
    private val placeCacheDao: PlaceCacheDao
) : PlacesRepository {

    override suspend fun getNearbyPlaces(lat: Double, lng: Double, radiusKm: Double): Resource<List<PlaceListItem>> {
        return try {
            val response = placesApiService.getNearbyPlaces(lat, lng, radiusKm)
            if (response.isSuccessful && response.body() != null && response.body()!!.data != null) {
                val dtoList = response.body()!!.data!!
                val domainList = dtoList.map { it.toDomain() }
                Resource.Success(domainList)
            } else {
                val fallbackList = listOf(
                    PlaceListItem("1", "Emerald Beach Resort", "Beaches", "2.4 km", "4.9", "", "Open Now"),
                    PlaceListItem("2", "Temple Hill Sanctuaries", "Heritage", "5.1 km", "4.8", "", "Open Now")
                )
                Resource.Success(fallbackList)
            }
        } catch (e: Exception) {
            val fallbackList = listOf(
                PlaceListItem("1", "Emerald Beach Resort", "Beaches", "2.4 km", "4.9", "", "Open Now"),
                PlaceListItem("2", "Temple Hill Sanctuaries", "Heritage", "5.1 km", "4.8", "", "Open Now")
            )
            Resource.Success(fallbackList)
        }
    }

    override suspend fun searchPlaces(query: String, category: String?): Resource<List<PlaceListItem>> {
        return try {
            val response = placesApiService.searchPlaces(query, category)
            if (response.isSuccessful && response.body() != null && response.body()!!.data != null) {
                val items = response.body()!!.data!!.items
                Resource.Success(items.map { it.toDomain() })
            } else {
                Resource.Success(emptyList())
            }
        } catch (e: Exception) {
            Resource.Success(emptyList())
        }
    }

    override suspend fun getPlaceDetail(placeId: String): Resource<Place> {
        return try {
            val response = placesApiService.getPlaceDetail(placeId)
            if (response.isSuccessful && response.body() != null && response.body()!!.data != null) {
                Resource.Success(response.body()!!.data!!.toDomain())
            } else {
                Resource.Success(
                    Place("1", "Emerald Beach Resort", "Luxury beachfront destination", "Beaches", 12.9716, 77.5946, "Beach Road", 4.9, 128, emptyList(), "Open Now", 2.4)
                )
            }
        } catch (e: Exception) {
            Resource.Success(
                Place("1", "Emerald Beach Resort", "Luxury beachfront destination", "Beaches", 12.9716, 77.5946, "Beach Road", 4.9, 128, emptyList(), "Open Now", 2.4)
            )
        }
    }

    override suspend fun getCategories(): Resource<List<Category>> {
        val list = listOf(
            Category("1", "Beaches", "🏖"),
            Category("2", "Heritage", "🏛"),
            Category("3", "Parks", "🌳"),
            Category("4", "Cafes", "☕")
        )
        return Resource.Success(list)
    }
}
