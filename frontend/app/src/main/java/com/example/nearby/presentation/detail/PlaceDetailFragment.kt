package com.example.nearby.presentation.detail

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.nearby.R
import com.example.nearby.databinding.FragmentPlaceDetailBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.domain.map.MapStyleProvider
import com.example.nearby.presentation.detail.adapter.CategoryChipAdapter
import com.example.nearby.presentation.detail.adapter.CategoryChipItem
import com.example.nearby.presentation.detail.adapter.FacilityAdapter
import com.example.nearby.presentation.detail.adapter.GalleryPreviewAdapter
import com.example.nearby.presentation.detail.adapter.NearbyPlacesAdapter
import com.example.nearby.presentation.detail.adapter.ReviewAdapter
import com.example.nearby.presentation.detail.adapter.TimingAdapter
import com.example.nearby.presentation.reviewform.ReviewSheet
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import org.maplibre.android.annotations.MarkerOptions
import org.maplibre.android.camera.CameraPosition
import org.maplibre.android.camera.CameraUpdateFactory
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.MapLibreMap
import org.maplibre.android.maps.Style
import javax.inject.Inject

@AndroidEntryPoint
class PlaceDetailFragment : Fragment() {

    private var _binding: FragmentPlaceDetailBinding? = null
    private val binding get() = _binding!!

    private val viewModel: PlaceDetailViewModel by viewModels()

    @Inject lateinit var styleProvider: MapStyleProvider

    private lateinit var categoryChipAdapter: CategoryChipAdapter
    private lateinit var galleryPreviewAdapter: GalleryPreviewAdapter
    private lateinit var facilityAdapter: FacilityAdapter
    private lateinit var reviewAdapter: ReviewAdapter
    private lateinit var nearbyPlacesAdapter: NearbyPlacesAdapter

    private var mapLibreMap: MapLibreMap? = null
    private var currentPlaceLocation: LatLng? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPlaceDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        val placeId = arguments?.getString("placeId")
            ?: arguments?.getString("place_id")
            ?: arguments?.getString("place_slug")
            ?: "lotus-temple"
        val nameHint = arguments?.getString("placeName") ?: arguments?.getString("place_name") ?: ""
        val categoryHint = arguments?.getString("placeCategory") ?: arguments?.getString("category") ?: ""

        setupToolbar()
        setupRecyclerViews()
        setupMapLibre(savedInstanceState)
        setupListeners()

        val currentPlace = viewModel.uiState.value.place
        if (currentPlace == null || (currentPlace.id != placeId && !currentPlace.name.equals(nameHint, ignoreCase = true))) {
            viewModel.loadPlaceDetails(placeId, nameHint, categoryHint)
        } else {
            renderPlaceDetails(currentPlace)
        }
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.detailEmeraldToolbar.setTitle("Place Details")
        binding.detailEmeraldToolbar.setSubtitle("Explore Destination Details")
        binding.detailEmeraldToolbar.setBackButtonVisible(true)
        binding.detailEmeraldToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }
    }

    private fun setupRecyclerViews() {
        categoryChipAdapter = CategoryChipAdapter { item -> }

        galleryPreviewAdapter = GalleryPreviewAdapter(
            onPhotoClick = { index, _ ->
                val place = viewModel.uiState.value.place ?: return@GalleryPreviewAdapter
                openGalleryScreen(place)
            },
            onViewAllClick = {
                val place = viewModel.uiState.value.place ?: return@GalleryPreviewAdapter
                openGalleryScreen(place)
            }
        )

        facilityAdapter = FacilityAdapter()
        reviewAdapter = ReviewAdapter()
        nearbyPlacesAdapter = NearbyPlacesAdapter { place ->
            viewModel.loadPlaceDetails(place.id, place.name, place.category)
        }

        binding.rvCategoryChips.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = categoryChipAdapter
        }

        binding.rvGalleryPreview.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = galleryPreviewAdapter
        }

        binding.rvFacilities.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = facilityAdapter
        }

        binding.rvReviews.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = reviewAdapter
        }

        binding.rvNearbyPlaces.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = nearbyPlacesAdapter
        }
    }

    private fun setupMapLibre(savedInstanceState: Bundle?) {
        try {
            binding.detailMapView.onCreate(savedInstanceState)
            binding.detailMapView.getMapAsync { map ->
                this.mapLibreMap = map
                val nightMask = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
                val isDark = (nightMask == android.content.res.Configuration.UI_MODE_NIGHT_YES)
                val styleUrl = if (isDark) styleProvider.getDarkStyleUrl() else styleProvider.getLightStyleUrl()

                map.setStyle(Style.Builder().fromUri(styleUrl)) {
                    currentPlaceLocation?.let { loc ->
                        updateMapMarker(loc)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("PlaceDetail", "MapView initialization notice: ${e.message}")
        }

        binding.btnMapZoomIn.setOnClickListener {
            mapLibreMap?.animateCamera(CameraUpdateFactory.zoomIn())
        }

        binding.btnMapZoomOut.setOnClickListener {
            mapLibreMap?.animateCamera(CameraUpdateFactory.zoomOut())
        }
    }

    private fun updateMapMarker(loc: LatLng) {
        val map = mapLibreMap ?: return
        val currentPlace = viewModel.uiState.value.place
        try {
            map.clear()
            map.addMarker(
                MarkerOptions()
                    .position(loc)
                    .title(currentPlace?.name ?: "Destination")
                    .snippet(currentPlace?.category ?: "Historical")
            )
            map.animateCamera(
                CameraUpdateFactory.newCameraPosition(
                    CameraPosition.Builder().target(loc).zoom(14.5).build()
                ),
                1000
            )
        } catch (e: Exception) {
            Log.e("PlaceDetail", "Error updating map marker: ${e.message}")
        }
    }

    private fun setupListeners() {
        binding.btnDetailFavorite.setOnClickListener {
            viewModel.toggleFavorite()
        }

        binding.btnViewAllGallery.setOnClickListener {
            val place = viewModel.uiState.value.place ?: return@setOnClickListener
            openGalleryScreen(place)
        }

        binding.btnWriteReview.setOnClickListener {
            val sheet = ReviewSheet(requireContext()) { rating, comment ->
                viewModel.submitReview(rating, comment)
            }
            sheet.show()
        }

        binding.btnGetDirections.setOnClickListener {
            val place = viewModel.uiState.value.place
            if (place != null) {
                val bundle = Bundle().apply {
                    putString("placeId", place.id)
                    putDouble("latitude", place.latitude)
                    putDouble("longitude", place.longitude)
                    putString("placeName", place.name)
                    putString("placeCategory", place.category)
                    putString("rating", place.rating)
                    putString("heroImage", place.galleryImages.firstOrNull() ?: "")
                }
                try {
                    findNavController().navigate(R.id.navigationFragment, bundle)
                } catch (e: Exception) {
                    val gmmIntentUri = Uri.parse("google.navigation:q=${place.latitude},${place.longitude}&mode=d")
                    val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
                    mapIntent.setPackage("com.google.android.apps.maps")
                    if (mapIntent.resolveActivity(requireActivity().packageManager) != null) {
                        startActivity(mapIntent)
                    } else {
                        val browserUri = Uri.parse("https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}")
                        startActivity(Intent(Intent.ACTION_VIEW, browserUri))
                    }
                }
            }
        }
    }

    private fun openGalleryScreen(place: DetailPlaceModel) {
        val bundle = Bundle().apply {
            putString("placeId", place.id)
            putString("placeName", place.name)
            putString("placeSlug", place.name.lowercase().replace(" ", "-"))
        }
        findNavController().navigate(R.id.galleryFragment, bundle)
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        if (state.isLoading && state.place == null) {
                            binding.incDetailSkeleton.root.visibility = View.VISIBLE
                            binding.detailScrollView.visibility = View.GONE
                        } else {
                            binding.incDetailSkeleton.root.visibility = View.GONE
                            binding.detailScrollView.visibility = View.VISIBLE
                            renderPlaceDetails(state.place)
                        }
                    }
                }
                launch {
                    viewModel.eventFlow.collect { event ->
                        handleEvent(event)
                    }
                }
            }
        }
    }

    private fun renderPlaceDetails(place: DetailPlaceModel?) {
        place ?: return

        // HERO COVER IMAGE
        val coverUrl = place.galleryImages.firstOrNull()
        binding.heroCarousel.setImage(coverUrl)

        // TOOLBAR TITLE
        binding.detailEmeraldToolbar.setTitle(place.name)

        // TITLE & CATEGORY
        binding.tvDetailTitle.text = place.name
        binding.tvDetailCategory.text = "#${place.category.uppercase()}"
        binding.tvDetailAddress.text = place.address

        // DESCRIPTION & HISTORY
        binding.viewDescription.setText(place.description)
        binding.tvWikipediaHistory.text = place.wikipediaHistory

        // CATEGORY CHIPS
        val categories = listOf("Historical", "Temple", "Museum", "Nature", "Beach", "Adventure", "Park")
        val chipItems = categories.map { cat ->
            CategoryChipItem(
                id = cat,
                name = cat,
                isSelected = cat.equals(place.category, ignoreCase = true)
            )
        }
        categoryChipAdapter.submitList(chipItems)

        // RATING OVERVIEW CARD
        binding.cardRatingOverview.setRating(place.rating, place.totalReviews.toIntOrNull() ?: 0)

        // KEY DETAILS
        binding.tvDetailEntryFee.text = place.entryFee
        binding.tvDetailBestTime.text = place.bestTimeToVisit
        binding.tvDetailHours.text = place.openingHours

        // MAP COORDINATES & MAPLIBRE RECENTER
        if (place.latitude != 0.0 && place.longitude != 0.0) {
            val loc = LatLng(place.latitude, place.longitude)
            if (currentPlaceLocation != loc) {
                currentPlaceLocation = loc
                updateMapMarker(loc)
            }
        }

        // FAVORITE STATE
        val favIcon = if (place.isFavorite) R.drawable.ic_heart_filled else R.drawable.ic_heart
        binding.btnDetailFavorite.setImageResource(favIcon)

        // ADAPTER LISTS
        galleryPreviewAdapter.submitList(place.galleryImages)
        facilityAdapter.submitList(place.facilities)

        // REVIEWS & NEARBY DESTINATIONS
        if (place.reviews.isNotEmpty()) {
            reviewAdapter.submitList(place.reviews)
            binding.rvReviews.visibility = View.VISIBLE
        }
        if (place.nearbyPlaces.isNotEmpty()) {
            nearbyPlacesAdapter.submitList(place.nearbyPlaces)
            binding.rvNearbyPlaces.visibility = View.VISIBLE
        }
    }

    private fun handleEvent(event: PlaceDetailEvent) {
        when (event) {
            is PlaceDetailEvent.OpenDirections -> {
                activity?.let { act ->
                    EmeraldToastManager.showToast(act, "Map Radar & Directions", "Calculating shortest route...", EmeraldToastManager.Type.INFO)
                }
            }
            is PlaceDetailEvent.OpenReviewSheet -> {
                val sheet = ReviewSheet(requireContext()) { rating, comment ->
                    viewModel.submitReview(rating, comment)
                }
                sheet.show()
            }
            else -> {}
        }
    }

    override fun onStart() { super.onStart(); try { _binding?.detailMapView?.onStart() } catch (e: Exception) {} }
    override fun onResume() { super.onResume(); try { _binding?.detailMapView?.onResume() } catch (e: Exception) {} }
    override fun onPause() { super.onPause(); try { _binding?.detailMapView?.onPause() } catch (e: Exception) {} }
    override fun onStop() { super.onStop(); try { _binding?.detailMapView?.onStop() } catch (e: Exception) {} }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        try { _binding?.detailMapView?.onSaveInstanceState(outState) } catch (e: Exception) {}
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        _binding?.rvCategoryChips?.adapter = null
        _binding?.rvGalleryPreview?.adapter = null
        _binding?.rvFacilities?.adapter = null
        _binding?.rvReviews?.adapter = null
        _binding?.rvNearbyPlaces?.adapter = null
        mapLibreMap?.clear()
        mapLibreMap = null
        try { _binding?.detailMapView?.onDestroy() } catch (e: Exception) {}
        super.onDestroyView()
        _binding = null
    }

    override fun onLowMemory() {
        super.onLowMemory()
        try { _binding?.detailMapView?.onLowMemory() } catch (e: Exception) {}
    }
}
