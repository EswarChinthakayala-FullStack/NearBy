package com.example.nearby.presentation.explore

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.Pager
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.example.nearby.R
import com.example.nearby.database.dao.ExploreSearchDao
import com.example.nearby.database.entity.ExploreRecentSearchEntity
import com.example.nearby.presentation.explore.paging.ExplorePagingConfig
import com.example.nearby.presentation.explore.paging.ExplorePagingSource
import com.example.nearby.presentation.home.PlaceItem
import com.tourismguide.app.data.remote.api.ExploreSearchFiltersDto
import com.tourismguide.app.data.remote.api.PlacesApiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ExploreViewModel @Inject constructor(
    private val placesApiService: PlacesApiService,
    private val favoriteManager: com.example.nearby.presentation.favorites.FavoriteManager,
    private val exploreSearchDao: ExploreSearchDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(ExploreUiState())
    val uiState: StateFlow<ExploreUiState> = _uiState.asStateFlow()

    private val _eventFlow = MutableSharedFlow<ExploreEvent>()
    val eventFlow: SharedFlow<ExploreEvent> = _eventFlow.asSharedFlow()

    private val searchQueryState = MutableStateFlow("")
    private val filterStateFlow = MutableStateFlow(ExploreFilterState())
    private val sortByState = MutableStateFlow("Relevance")

    // Default coordinates (Tallur Region)
    private var currentLat = 13.6258
    private var currentLng = 74.6939

    @OptIn(ExperimentalCoroutinesApi::class)
    val pagedPlaces: StateFlow<PagingData<PlaceItem>> = combine(
        searchQueryState,
        filterStateFlow,
        sortByState
    ) { query, filter, sortBy ->
        Triple(query, filter, sortBy)
    }.flatMapLatest { (query, filter, sortBy) ->
        val filtersDto = ExploreSearchFiltersDto(
            distance = if (filter.distanceText == "Anywhere") null else filter.distanceText,
            categories = if (filter.selectedCategory == "All") null else listOf(filter.selectedCategory),
            rating = if (filter.ratingText == "Any") null else filter.ratingText,
            price = if (filter.entryFeeText == "Any") null else filter.entryFeeText,
            openStatus = filter.openNowOnly,
            accessibility = buildAccessibilityList(filter),
            entryFee = if (filter.entryFeeText == "Any") null else filter.entryFeeText,
            crowdLevel = if (filter.crowdLevelText == "Any") null else filter.crowdLevelText
        )

        Pager(
            config = ExplorePagingConfig.defaultConfig(),
            pagingSourceFactory = {
                ExplorePagingSource(
                    placesApiService = placesApiService,
                    query = query.ifBlank { null },
                    latitude = currentLat,
                    longitude = currentLng,
                    filters = filtersDto,
                    sortBy = sortBy
                )
            }
        ).flow
    }.cachedIn(viewModelScope).let { flow ->
        val result = MutableStateFlow<PagingData<PlaceItem>>(PagingData.empty())
        viewModelScope.launch {
            flow.collect { result.value = it }
        }
        result.asStateFlow()
    }

    init {
        loadDefaultCategories()
        observeRecentSearches()
        observeFavorites()
    }

    fun updateCoordinates(lat: Double, lng: Double) {
        currentLat = lat
        currentLng = lng
        triggerRefresh()
    }

    private fun observeRecentSearches() {
        viewModelScope.launch {
            exploreSearchDao.getRecentSearchesFlow().collect { entities ->
                val queries = entities.map { it.query }
                _uiState.update { it.copy(recentSearches = queries) }
            }
        }
    }

    private fun observeFavorites() {
        viewModelScope.launch {
            favoriteManager.favoriteSlugs.collect { slugs ->
                // Paging 3 auto-updates via recycler refresh or we can trigger re-submission
            }
        }
    }

    fun dispatchAction(action: ExploreAction) {
        when (action) {
            is ExploreAction.OnSearchQueryChanged -> {
                _uiState.update { it.copy(searchQuery = action.query) }
                searchQueryState.value = action.query
                
                // Add to recent search cache
                if (action.query.isNotBlank()) {
                    viewModelScope.launch {
                        exploreSearchDao.insertRecentSearch(ExploreRecentSearchEntity(action.query.trim()))
                    }
                }
            }
            is ExploreAction.OnCategorySelected -> {
                val updatedCategories = _uiState.value.categories.map {
                    it.copy(isSelected = (it.name == action.categoryName))
                }
                _uiState.update { 
                    it.copy(
                        categories = updatedCategories,
                        filterState = it.filterState.copy(selectedCategory = action.categoryName)
                    )
                }
                filterStateFlow.update { it.copy(selectedCategory = action.categoryName) }
                rebuildActiveChips()
            }
            is ExploreAction.OnSortSelected -> {
                sortByState.value = action.sortMode.displayName
                _uiState.update { 
                    it.copy(filterState = it.filterState.copy(sortText = action.sortMode.displayName))
                }
                filterStateFlow.update { it.copy(sortText = action.sortMode.displayName) }
                rebuildActiveChips()
            }
            is ExploreAction.OnFilterApplied -> {
                _uiState.update { it.copy(filterState = action.newFilterState, isFilterDrawerVisible = false) }
                filterStateFlow.value = action.newFilterState
                sortByState.value = action.newFilterState.sortText
                rebuildActiveChips()
            }
            is ExploreAction.OnFilterChipRemoved -> {
                removeFilterChip(action.chipId)
            }
            is ExploreAction.OnClearAllFilters -> {
                val reset = ExploreFilterState()
                _uiState.update { it.copy(filterState = reset, activeFilterChips = emptyList()) }
                filterStateFlow.value = reset
                sortByState.value = "Relevance"
            }
            is ExploreAction.OnPlaceClicked -> {
                viewModelScope.launch {
                    _eventFlow.emit(ExploreEvent.NavigateToPlaceDetails(action.placeId))
                }
            }
            is ExploreAction.OnBookmarkToggled -> {
                favoriteManager.toggleFavorite(action.placeId) // action.placeId holds the place slug
            }
            is ExploreAction.OnFilterFabClicked -> {
                _uiState.update { it.copy(isFilterDrawerVisible = true) }
            }
            is ExploreAction.OnSortClicked -> {
                _uiState.update { it.copy(isFilterDrawerVisible = true) } // custom filter drawer handles both
            }
            is ExploreAction.OnRecentSearchClicked -> {
                dispatchAction(ExploreAction.OnSearchQueryChanged(action.query))
            }
            is ExploreAction.OnSearchSuggestionClicked -> {
                dispatchAction(ExploreAction.OnSearchQueryChanged(action.suggestion))
            }
            is ExploreAction.OnVoiceSearchClicked -> {
                viewModelScope.launch {
                    _eventFlow.emit(ExploreEvent.ShowToast("Voice Search", "Listening..."))
                }
            }
        }
    }

    fun toggleViewMode() {
        _uiState.update { it.copy(isGridView = !it.isGridView) }
    }

    fun setViewMode(isGrid: Boolean) {
        _uiState.update { it.copy(isGridView = isGrid) }
    }

    fun closeFilterDrawer() {
        _uiState.update { it.copy(isFilterDrawerVisible = false) }
    }

    private fun rebuildActiveChips() {
        val filter = filterStateFlow.value
        val chips = mutableListOf<FilterChipItem>()
        if (filter.selectedCategory != "All") {
            chips.add(FilterChipItem("cat", filter.selectedCategory, "category"))
        }
        if (filter.distanceText != "Anywhere") {
            chips.add(FilterChipItem("dist", "Range: ${filter.distanceText}", "distance"))
        }
        if (filter.ratingText != "Any") {
            chips.add(FilterChipItem("rate", "Rating: ${filter.ratingText}", "rating"))
        }
        if (filter.entryFeeText != "Any") {
            chips.add(FilterChipItem("fee", filter.entryFeeText, "price"))
        }
        if (filter.crowdLevelText != "Any") {
            chips.add(FilterChipItem("crowd", "Crowd: ${filter.crowdLevelText}", "crowd"))
        }
        _uiState.update { it.copy(activeFilterChips = chips) }
    }

    private fun removeFilterChip(chipId: String) {
        val current = filterStateFlow.value
        val updated = when (chipId) {
            "cat" -> current.copy(selectedCategory = "All")
            "dist" -> current.copy(distanceText = "Anywhere")
            "rate" -> current.copy(ratingText = "Any")
            "fee" -> current.copy(entryFeeText = "Any")
            "crowd" -> current.copy(crowdLevelText = "Any")
            else -> current
        }
        filterStateFlow.value = updated
        _uiState.update { it.copy(filterState = updated) }
        rebuildActiveChips()
    }

    private fun buildAccessibilityList(filter: ExploreFilterState): List<String>? {
        val list = mutableListOf<String>()
        if (filter.wheelchairAccessible) list.add("Wheelchair")
        if (filter.parkingAvailable) list.add("Parking")
        if (filter.familyFriendly) list.add("Family")
        if (filter.petFriendly) list.add("Pet")
        return list.ifEmpty { null }
    }

    private fun loadDefaultCategories() {
        val categories = listOf(
            CategoryItem("1", "All", R.drawable.ic_map, isSelected = true),
            CategoryItem("2", "Temple", R.drawable.ic_map),
            CategoryItem("3", "Nature", R.drawable.ic_map),
            CategoryItem("4", "Historical", R.drawable.ic_map),
            CategoryItem("5", "Beach", R.drawable.ic_map),
            CategoryItem("6", "Museum", R.drawable.ic_map)
        )
        _uiState.update { it.copy(categories = categories) }
    }

    private fun triggerRefresh() {
        // Refresh by updating flow triggers
        val q = searchQueryState.value
        searchQueryState.value = q
    }
}
