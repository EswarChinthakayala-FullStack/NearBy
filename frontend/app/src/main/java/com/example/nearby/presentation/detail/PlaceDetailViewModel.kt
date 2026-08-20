package com.example.nearby.presentation.detail

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.R
import com.example.nearby.data.local.SessionManager
import com.example.nearby.presentation.home.PlaceItem
import com.tourismguide.app.data.remote.api.PlacesApiService
import com.tourismguide.app.data.remote.api.ReviewsApiService
import com.tourismguide.app.data.remote.dto.PlaceDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject

object PlaceDetailCache {
    private val memoryCache = ConcurrentHashMap<String, DetailPlaceModel>()

    fun get(key: String): DetailPlaceModel? {
        if (key.isBlank()) return null
        return memoryCache[key] ?: memoryCache.values.find {
            it.id.equals(key, ignoreCase = true) ||
            it.name.equals(key, ignoreCase = true) ||
            it.name.lowercase().replace(" ", "-").equals(key.lowercase().replace(" ", "-"), ignoreCase = true)
        }
    }

    fun put(key: String, model: DetailPlaceModel) {
        if (key.isNotBlank()) memoryCache[key] = model
        if (model.id.isNotBlank()) memoryCache[model.id] = model
        val slug = model.name.lowercase().replace(" ", "-")
        if (slug.isNotBlank()) memoryCache[slug] = model
    }
}

fun PlaceDto.toDetailPlaceModel(): DetailPlaceModel {
    val gallery = imageUrls
    return DetailPlaceModel(
        id = id,
        name = name,
        category = category,
        rating = if (avgRating > 0) String.format(java.util.Locale.US, "%.1f", avgRating) else "4.5",
        totalReviews = totalReviews.toString(),
        address = address.ifEmpty { "Delhi, India" },
        isFavorite = isFavorite,
        galleryImages = gallery,
        description = description,
        wikipediaHistory = history ?: description,
        entryFee = entryFee ?: "Free Entry",
        bestTimeToVisit = bestTimeToVisit ?: "October to March",
        openingHours = "9:00 AM – 6:00 PM",
        latitude = latitude,
        longitude = longitude,
        facilities = listOf(
            FacilityItem("1", "Guided Tours", R.drawable.ic_check),
            FacilityItem("2", "Restrooms & Water", R.drawable.ic_check),
            FacilityItem("3", "Parking Available", R.drawable.ic_check)
        ),
        reviews = emptyList(),
        nearbyPlaces = emptyList(),
        slug = slug
    )
}

@HiltViewModel
class PlaceDetailViewModel @Inject constructor(
    private val placesApiService: PlacesApiService,
    private val reviewsApiService: ReviewsApiService,
    private val sessionManager: SessionManager,
    private val favoriteManager: com.example.nearby.presentation.favorites.FavoriteManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(PlaceDetailUiState())
    val uiState: StateFlow<PlaceDetailUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            favoriteManager.favoriteSlugs.collect { favSlugs ->
                _uiState.update { state ->
                    val p = state.place ?: return@update state
                    val slugStr = p.slug.ifEmpty { p.id }
                    val isFav = favSlugs.contains(slugStr)
                    state.copy(place = p.copy(isFavorite = isFav))
                }
            }
        }
    }

    private val _eventFlow = MutableSharedFlow<PlaceDetailEvent>()
    val eventFlow: SharedFlow<PlaceDetailEvent> = _eventFlow.asSharedFlow()

    fun loadPlaceDetails(placeId: String, nameHint: String = "", categoryHint: String = "") {
        viewModelScope.launch {
            // 1. Instant Memory Cache Lookup (prevents photo disappearance when navigating back from gallery!)
            val cachedModel = PlaceDetailCache.get(placeId) ?: PlaceDetailCache.get(nameHint)
            if (cachedModel != null && cachedModel.galleryImages.isNotEmpty()) {
                Log.d("PlaceDetailVM", "Serving place detail from memory cache for key '$placeId' with ${cachedModel.galleryImages.size} photos")
                _uiState.update { it.copy(isLoading = false, place = cachedModel) }
                return@launch
            }

            // 2. StateFlow state check
            val currentPlace = _uiState.value.place
            if (currentPlace != null && (currentPlace.id == placeId || currentPlace.name.equals(nameHint, ignoreCase = true))) {
                if (currentPlace.galleryImages.isNotEmpty()) {
                    _uiState.update { it.copy(isLoading = false) }
                    return@launch
                }
            }

            _uiState.update { it.copy(isLoading = true) }

            try {
                Log.d("PlaceDetailVM", "Loading place detail for UUID/id: '$placeId'")
                val response = placesApiService.getPlaceDetail(placeId)
                if (response.isSuccessful && response.body()?.data != null) {
                    val dto = response.body()!!.data!!
                    Log.d("PlaceDetailVM", "API returned place: name='${dto.name}', uuid='${dto.uuid}', slug='${dto.slug}'")
                    var detailModel = dto.toDetailPlaceModel()

                    val existingPhotos = _uiState.value.place?.galleryImages ?: cachedModel?.galleryImages
                    if (!existingPhotos.isNullOrEmpty()) {
                        detailModel = detailModel.copy(galleryImages = existingPhotos)
                    }

                    PlaceDetailCache.put(placeId, detailModel)
                    PlaceDetailCache.put(dto.uuid, detailModel)
                    PlaceDetailCache.put(dto.slug, detailModel)

                    _uiState.update { it.copy(isLoading = false, place = detailModel) }

                    // Fetch live photos, Wikipedia data, Reviews, and Nearby destinations in parallel
                    val targetIdentifier = dto.slug.ifEmpty { dto.uuid.ifEmpty { placeId } }
                    fetchPhotosData(targetIdentifier, nameHint.ifEmpty { dto.name }, placeId)
                    fetchWikipediaData(placeId, detailModel)
                    fetchReviewsData(placeId)
                    fetchNearbyPlacesData(detailModel.latitude, detailModel.longitude)
                } else {
                    Log.w("PlaceDetailVM", "API call unsuccessful or empty data: ${response.code()}")
                    loadFallbackData(placeId, nameHint, categoryHint)
                }
            } catch (e: Exception) {
                Log.e("PlaceDetailVM", "Error loading place detail: ${e.message}", e)
                loadFallbackData(placeId, nameHint, categoryHint)
            }
        }
    }

    private fun fetchPhotosData(identifier: String, fallbackName: String = "", placeId: String = "") {
        viewModelScope.launch {
            try {
                val querySlug = identifier.ifEmpty { fallbackName.lowercase().replace(" ", "-") }
                Log.d("PlaceDetailVM", "Fetching photos for identifier/slug: '$querySlug'")
                val photosRes = placesApiService.getPlacePhotos(querySlug, limit = 25)
                if (photosRes.isSuccessful && !photosRes.body()?.data.isNullOrEmpty()) {
                    val livePhotoUrls = photosRes.body()!!.data!!.map { it.displayUrl }.filter { it.isNotEmpty() }
                    if (livePhotoUrls.isNotEmpty()) {
                        Log.d("PlaceDetailVM", "Retrieved ${livePhotoUrls.size} live photos for '$querySlug'")
                        _uiState.update { state ->
                            val current = state.place ?: return@update state
                            val updated = current.copy(galleryImages = livePhotoUrls)
                            PlaceDetailCache.put(identifier, updated)
                            if (placeId.isNotBlank()) PlaceDetailCache.put(placeId, updated)
                            state.copy(place = updated)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.w("PlaceDetailVM", "Fetch photos note: ${e.message}")
            }
        }
    }

    private fun fetchWikipediaData(placeId: String, currentModel: DetailPlaceModel) {
        viewModelScope.launch {
            try {
                val wikiRes = placesApiService.getPlaceWikipedia(placeId)
                if (wikiRes.isSuccessful && wikiRes.body()?.data != null) {
                    val wikiData = wikiRes.body()!!.data!!
                    val updatedModel = currentModel.copy(
                        wikipediaHistory = wikiData.summary.ifEmpty { currentModel.wikipediaHistory },
                        description = if (currentModel.description.isEmpty()) wikiData.summary else currentModel.description
                    )
                    PlaceDetailCache.put(placeId, updatedModel)
                    _uiState.update { it.copy(place = updatedModel) }
                }
            } catch (e: Exception) {
                Log.w("PlaceDetailVM", "Wikipedia fetch note: ${e.message}")
            }
        }
    }

    private fun fetchReviewsData(placeId: String) {
        viewModelScope.launch {
            try {
                val res = reviewsApiService.getPlaceReviews(placeId)
                if (res.isSuccessful && !res.body()?.data.isNullOrEmpty()) {
                    val dtos = res.body()!!.data!!
                    val reviewItems = dtos.map { r ->
                        ReviewItem(
                            id = r.id,
                            authorName = r.resolvedAuthorName,
                            rating = r.rating,
                            dateAgo = r.createdAt.take(10),
                            comment = r.comment,
                            avatarUrl = r.resolvedAvatarUrl,
                            authorEmail = r.resolvedAuthorEmail
                        )
                    }
                    _uiState.update { state ->
                        val current = state.place ?: return@update state
                        val updated = current.copy(reviews = reviewItems)
                        PlaceDetailCache.put(placeId, updated)
                        state.copy(place = updated)
                    }
                }
            } catch (e: Exception) {
                Log.w("PlaceDetailVM", "Reviews fetch note: ${e.message}")
            }
        }
    }

    private fun fetchNearbyPlacesData(lat: Double, lng: Double) {
        viewModelScope.launch {
            try {
                val res = placesApiService.getNearbyPlaces(lat, lng)
                if (res.isSuccessful && !res.body()?.data.isNullOrEmpty()) {
                    val dtos = res.body()!!.data!!
                    val nearbyItems = dtos.map { p ->
                        PlaceItem(
                            id = p.id,
                            name = p.name,
                            category = p.category,
                            distance = p.distanceFormatted,
                            rating = p.ratingFormatted,
                            openStatus = p.openStatus,
                            isFavorite = p.isFavorite,
                            imageUrl = p.imageUrl
                        )
                    }
                    _uiState.update { state ->
                        val current = state.place ?: return@update state
                        val updated = current.copy(nearbyPlaces = nearbyItems)
                        state.copy(place = updated)
                    }
                }
            } catch (e: Exception) {
                Log.w("PlaceDetailVM", "Nearby fetch note: ${e.message}")
            }
        }
    }

    private fun loadFallbackData(placeId: String, nameHint: String, categoryHint: String) {
        val name = nameHint.ifEmpty { "Golkonda Fort" }
        val category = categoryHint.ifEmpty { "Historical" }
        val fallbackModel = DetailPlaceModel(
            id = placeId,
            name = name,
            category = category,
            rating = "4.8",
            totalReviews = "1,240",
            address = "Hyderabad, Telangana, India",
            isFavorite = false,
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
            ),
            description = "A magnificent historical fortress located in Hyderabad known for its acoustics, architecture, and rich heritage.",
            wikipediaHistory = "Built in the 16th century by the Qutb Shahi dynasty, Golkonda Fort served as the capital of the Qutb Shahi kingdom.",
            entryFee = "₹25 (Indian) / ₹300 (Foreigner)",
            bestTimeToVisit = "October to March",
            openingHours = "9:00 AM – 5:30 PM",
            latitude = 17.3833,
            longitude = 78.4011,
            facilities = listOf(
                FacilityItem("1", "Guided Tours", R.drawable.ic_check),
                FacilityItem("2", "Restrooms & Water", R.drawable.ic_check),
                FacilityItem("3", "Parking Available", R.drawable.ic_check)
            ),
            reviews = emptyList(),
            nearbyPlaces = emptyList()
        )
        PlaceDetailCache.put(placeId, fallbackModel)
        _uiState.update { it.copy(isLoading = false, place = fallbackModel) }
    }

    fun toggleFavorite() {
        val current = _uiState.value.place ?: return
        val slugStr = current.slug.ifEmpty { current.id }
        favoriteManager.toggleFavorite(slugStr)
    }

    fun submitReview(rating: Float, comment: String) {
        val currentPlace = _uiState.value.place ?: return
        val placeId = currentPlace.id
        viewModelScope.launch {
            try {
                Log.d("PlaceDetailVM", "Submitting review for placeId: '$placeId', rating=$rating")
                val body = com.tourismguide.app.data.remote.dto.ReviewCreateDto(rating = rating, comment = comment)
                val res = reviewsApiService.submitReview(placeId, body)
                if (res.isSuccessful && res.body()?.data != null) {
                    Log.d("PlaceDetailVM", "Review submitted successfully!")
                    _eventFlow.emit(PlaceDetailEvent.ShowToast("Review Submitted", "Thank you for your rating!"))
                    fetchReviewsData(placeId)
                } else {
                    Log.w("PlaceDetailVM", "Review submission failed with code ${res.code()}")
                    _eventFlow.emit(PlaceDetailEvent.ShowToast("Review Error", "Failed to submit review.", isError = true))
                }
            } catch (e: Exception) {
                Log.e("PlaceDetailVM", "Error submitting review: ${e.message}", e)
                _eventFlow.emit(PlaceDetailEvent.ShowToast("Review Error", "Review submission error.", isError = true))
            }
        }
    }
}
