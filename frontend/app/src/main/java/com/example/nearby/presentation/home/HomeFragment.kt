package com.example.nearby.presentation.home

import android.Manifest
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import coil3.request.crossfade
import com.example.nearby.R
import com.example.nearby.databinding.FragmentHomeBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.navigation.NavigationLocationManager
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val viewModel: HomeViewModel by viewModels()

    @Inject
    lateinit var navigationLocationManager: NavigationLocationManager

    private val requestLocationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            binding.layoutLocationPermission.visibility = View.GONE
            fetchGpsAndLoadHome()
        } else {
            binding.layoutLocationPermission.visibility = View.VISIBLE
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }
        WindowInsetsHelper.applyStatusBarTopPadding(binding.layoutHomeHeader)

        setupClickListeners()
        observeUiState()
    }

    override fun onResume() {
        super.onResume()
        checkLocationPermissionAndFetch()
    }

    private fun checkLocationPermissionAndFetch() {
        if (navigationLocationManager.hasLocationPermission(requireContext())) {
            binding.layoutLocationPermission.visibility = View.GONE
            fetchGpsAndLoadHome()
        } else {
            binding.layoutLocationPermission.visibility = View.VISIBLE
        }
    }

    private fun fetchGpsAndLoadHome() {
        viewLifecycleOwner.lifecycleScope.launch {
            val latLng = navigationLocationManager.getInitialUserLocation(requireContext())
            viewModel.loadHomeData(latLng.latitude, latLng.longitude)
        }
    }

    private fun setupClickListeners() {
        binding.btnAllowLocation.setOnClickListener {
            requestLocationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }

        binding.btnNotNowLocation.setOnClickListener {
            // Leave the overlay visible or show empty state. We'll leave it visible to enforce location.
            activity?.let {
                EmeraldToastManager.showToast(
                    it, 
                    "Location Required", 
                    "Location is required for recommendations.", 
                    EmeraldToastManager.Type.ERROR
                )
            }
        }

        binding.cardHomeUserAvatar.setOnClickListener {
            safeNavigate(R.id.profileFragment)
        }

        binding.btnHomeNotification.setOnClickListener {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Notifications", "Your travel alerts are up to date.", EmeraldToastManager.Type.INFO)
            }
        }

        binding.btnHomeLocation.setOnClickListener {
            checkLocationPermissionAndFetch()
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "GPS Location", "Refreshing location coordinates...", EmeraldToastManager.Type.INFO)
            }
        }

        binding.cardHomeSearch.setOnClickListener {
            safeNavigate(R.id.exploreFragment)
        }

        binding.btnHomeAiAssist.setOnClickListener {
            safeNavigate(R.id.aiNearbyFragment)
        }

        binding.btnSeeAllTrending.setOnClickListener { safeNavigate(R.id.trendingFragment) }
        binding.btnSeeAllNearby.setOnClickListener { safeNavigate(R.id.nearbyAttractionsFragment) }
        binding.btnSeeAllRecommended.setOnClickListener { safeNavigate(R.id.recommendedFragment) }
        binding.btnSeeAllPopular.setOnClickListener { safeNavigate(R.id.popularFragment) }
    }

    private fun safeNavigate(resId: Int) {
        val controller = findNavController()
        if (controller.currentDestination?.id == R.id.homeFragment) {
            try {
                controller.navigate(resId)
            } catch (ignored: Exception) {}
        }
    }

    private fun observeUiState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.greetingText.collect { greeting ->
                        binding.tvHomeGreeting.text = greeting
                    }
                }

                launch {
                    viewModel.userName.collect { name ->
                        binding.tvHomeUserName.text = name
                        val initial = if (name.isNotBlank()) name.take(1).uppercase() else "A"
                        binding.tvHomeUserInitial.text = initial
                    }
                }

                launch {
                    viewModel.userAvatarUrl.collect { url ->
                        if (!url.isNullOrEmpty()) {
                            binding.ivHomeUserAvatar.visibility = View.VISIBLE
                            binding.tvHomeUserInitial.visibility = View.GONE
                            binding.ivHomeUserAvatar.load(url) {
                                crossfade(true)
                            }
                        } else {
                            binding.ivHomeUserAvatar.visibility = View.GONE
                            binding.tvHomeUserInitial.visibility = View.VISIBLE
                        }
                    }
                }

                launch {
                    viewModel.locationName.collect { loc ->
                        binding.btnHomeLocation.text = "📍 $loc"
                    }
                }

                launch {
                    viewModel.categoriesFlow.collect { cats ->
                        binding.rvCategories.adapter = CategoryAdapter(cats) { cat ->
                            safeNavigate(R.id.exploreFragment)
                        }
                    }
                }

                launch {
                    viewModel.trendingPlacesFlow.collect { list ->
                        binding.rvTrending.adapter = PlaceCardAdapter(list) { place ->
                            navigateToDetail(place.slug)
                        }
                    }
                }

                launch {
                    viewModel.nearbyPlacesFlow.collect { list ->
                        binding.rvNearby.adapter = PlaceCardAdapter(list) { place ->
                            navigateToDetail(place.slug)
                        }
                    }
                }

                launch {
                    viewModel.recommendedPlacesFlow.collect { list ->
                        binding.rvRecommended.adapter = PlaceCardAdapter(list) { place ->
                            navigateToDetail(place.slug)
                        }
                    }
                }

                launch {
                    viewModel.popularPlacesFlow.collect { list ->
                        binding.rvPopular.adapter = PlaceCardAdapter(list) { place ->
                            navigateToDetail(place.slug)
                        }
                    }
                }

                launch {
                    viewModel.bannersFlow.collect { banners ->
                        if (banners.isNotEmpty()) {
                            val b = banners.first()
                            binding.tvBannerTitle.text = b.title
                            binding.tvBannerSubtitle.text = b.subtitle
                            binding.ivBannerImage.load(b.imageUrl) {
                                crossfade(true)
                            }
                            binding.cardHomeBanner.setOnClickListener {
                                safeNavigate(R.id.exploreFragment)
                            }
                        }
                    }
                }
            }
        }
    }

    private fun navigateToDetail(placeId: String) {
        val bundle = Bundle().apply {
            putString("placeId", placeId)
        }
        val controller = findNavController()
        if (controller.currentDestination?.id == R.id.homeFragment) {
            try {
                controller.navigate(R.id.action_home_to_detail, bundle)
            } catch (e: Exception) {
                try {
                    controller.navigate(R.id.placeDetailFragment, bundle)
                } catch (ignored: Exception) {}
            }
        }
    }

    // Category Adapter
    private class CategoryAdapter(
        private val items: List<CategoryItem>,
        private val onClick: (CategoryItem) -> Unit
    ) : RecyclerView.Adapter<CategoryAdapter.ViewHolder>() {

        inner class ViewHolder(val v: View) : RecyclerView.ViewHolder(v) {
            val tvName: TextView = v.findViewById(R.id.tv_category_name)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val v = LayoutInflater.from(parent.context).inflate(R.layout.item_category, parent, false)
            return ViewHolder(v)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.tvName.text = "${item.icon} ${item.name}"
            holder.v.setOnClickListener { onClick(item) }
        }

        override fun getItemCount(): Int = items.size
    }

    // Place Card Adapter
    private inner class PlaceCardAdapter(
        private val items: List<PlaceItem>,
        private val onClick: (PlaceItem) -> Unit
    ) : RecyclerView.Adapter<PlaceCardAdapter.ViewHolder>() {

        inner class ViewHolder(val v: View) : RecyclerView.ViewHolder(v) {
            val ivCover: ImageView = v.findViewById(R.id.iv_place_thumbnail)
            val tvName: TextView = v.findViewById(R.id.tv_place_name)
            val tvCategory: TextView = v.findViewById(R.id.tv_place_category)
            val tvRating: TextView = v.findViewById(R.id.tv_place_rating)
            val tvDistance: TextView = v.findViewById(R.id.tv_place_distance)
            val btnFav: ImageButton = v.findViewById(R.id.btn_favorite)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val v = LayoutInflater.from(parent.context).inflate(R.layout.item_place_card, parent, false)
            return ViewHolder(v)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.tvName.text = item.name
            holder.tvCategory.text = "#${item.category.uppercase()}"
            holder.tvRating.text = item.rating
            holder.tvDistance.text = item.distance

            if (item.imageUrl.isNotBlank()) {
                holder.ivCover.load(item.imageUrl) {
                    crossfade(true)
                }
            }

            val favRes = if (item.isFavorite) R.drawable.ic_heart_filled else R.drawable.ic_heart
            holder.btnFav.setImageResource(favRes)

            holder.btnFav.setOnClickListener {
                viewModel.toggleFavorite(item.id)
            }

            holder.v.setOnClickListener { onClick(item) }
        }

        override fun getItemCount(): Int = items.size
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        binding.rvCategories.adapter = null
        binding.rvTrending.adapter = null
        binding.rvNearby.adapter = null
        binding.rvRecommended.adapter = null
        binding.rvPopular.adapter = null
        super.onDestroyView()
        _binding = null
    }
}
