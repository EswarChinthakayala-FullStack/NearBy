package com.example.nearby.presentation.navigation

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.databinding.FragmentNavigationBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.domain.map.MapStyleProvider
import com.example.nearby.presentation.map.MapManager
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.MapLibreMap
import org.maplibre.android.maps.Style
import javax.inject.Inject

@AndroidEntryPoint
class NavigationFragment : Fragment() {

    private var _binding: FragmentNavigationBinding? = null
    private val binding get() = _binding!!

    private val viewModel: NavigationViewModel by viewModels()

    @Inject lateinit var mapManager: MapManager
    @Inject lateinit var styleProvider: MapStyleProvider
    @Inject lateinit var permissionManager: NavigationPermissionManager

    private var mapLibreMap: MapLibreMap? = null
    private var isDarkModeActive: Boolean = false

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val isGranted = permissions.values.any { it }
        if (isGranted) {
            activity?.let {
                EmeraldToastManager.showToast(it, "Location Access", "GPS fix locked.", EmeraldToastManager.Type.SUCCESS)
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNavigationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        // Hide global bottom navigation bar for a clean full-screen experience
        activity?.findViewById<View>(R.id.inc_main_bottom_nav)?.visibility = View.GONE

        val nightMask = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
        isDarkModeActive = (nightMask == android.content.res.Configuration.UI_MODE_NIGHT_YES)

        val targetPlaceId = arguments?.getString("placeId") ?: ""
        val targetPlaceName = arguments?.getString("placeName") ?: "Destination"
        val targetCategory = arguments?.getString("placeCategory") ?: "Historical"
        val targetRating = arguments?.getString("rating") ?: "4.5"
        val targetLat = arguments?.getDouble("latitude") ?: 0.0
        val targetLng = arguments?.getDouble("longitude") ?: 0.0
        val targetHeroImage = arguments?.getString("heroImage") ?: ""

        setupToolbar(targetPlaceName)
        setupMapLibre(savedInstanceState)
        setupControls()
        setupListeners()

        checkAndRequestPermissions()

        viewModel.initializeNavigation(
            requireContext(),
            targetPlaceId,
            targetPlaceName,
            targetCategory,
            targetRating,
            targetLat,
            targetLng,
            targetHeroImage
        )

        observeViewModel()
    }

    private fun setupToolbar(title: String) {
        binding.navToolbar.setTitle(title)
        binding.navToolbar.setBackButtonVisible(true)
        binding.navToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }
    }

    private fun setupMapLibre(savedInstanceState: Bundle?) {
        binding.navigationMapView.onCreate(savedInstanceState)
        binding.navigationMapView.getMapAsync { map ->
            this.mapLibreMap = map
            mapManager.attachMap(requireContext(), map, isDarkModeActive)
        }
    }

    private fun setupControls() {
        binding.btnNavLocateMe.setOnClickListener {
            viewModel.uiState.value.userLocation?.let { pos ->
                mapManager.flyToPosition(pos, 15.5)
            }
        }
        binding.btnNavZoomIn.setOnClickListener { mapManager.zoomIn() }
        binding.btnNavZoomOut.setOnClickListener { mapManager.zoomOut() }
        binding.btnNavCompass.setOnClickListener { mapManager.resetCompassNorth() }
        binding.btnNavLayers.setOnClickListener {
            val styleUrl = if (isDarkModeActive) styleProvider.getLightStyleUrl() else styleProvider.getDarkStyleUrl()
            mapLibreMap?.setStyle(Style.Builder().fromUri(styleUrl))
            isDarkModeActive = !isDarkModeActive
            mapManager.syncThemeStyle(isDarkModeActive)
        }
    }

    private fun setupListeners() {
        binding.navigationDrawer.setOnStartNavigationClickListener {
            viewModel.onEvent(NavigationEvent.StartNavigationClicked)
        }
    }

    private fun checkAndRequestPermissions() {
        if (!permissionManager.isPermissionGranted(requireContext())) {
            locationPermissionLauncher.launch(permissionManager.getRequiredPermissions())
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        renderUiState(state)
                    }
                }
                launch {
                    viewModel.effectFlow.collect { effect ->
                        handleEffect(effect)
                    }
                }
            }
        }
    }

    private fun renderUiState(state: NavigationUiState) {
        val dest = state.destination ?: return

        binding.navToolbar.setTitle(dest.name)
        binding.tvNavLoadingMessage.text = state.loadingMessage
        binding.layoutNavLoadingOverlay.visibility = if (state.isLoading) View.VISIBLE else View.GONE

        if (state.routeWaypoints.isNotEmpty()) {
            val userPos = state.userLocation ?: LatLng(28.6139, 77.2090)
            val destPos = LatLng(dest.latitude, dest.longitude)

            mapManager.clearAll()
            mapManager.addCustomUserMarker(requireContext(), userPos, "My Location")
            mapManager.addCustomDestinationMarker(requireContext(), destPos, dest.name, "📍 #${dest.category.uppercase()} • Live Fix")
            mapManager.drawRoutePolyline(state.routeWaypoints, true)

            binding.navigationDrawer.setDestinationData(
                dest.name,
                dest.category,
                state.durationMinutes,
                state.distanceKm,
                dest.heroImageUrl
            )

            binding.navigationDrawer.submitTimelineSteps(state.routeSteps)
        }
    }

    private fun handleEffect(effect: NavigationEffect) {
        when (effect) {
            is NavigationEffect.AnimateCameraToBounds -> {
                mapManager.fitCameraToBounds(effect.points, effect.paddingPx)
            }
            is NavigationEffect.ShowToast -> {
                activity?.let { act ->
                    EmeraldToastManager.showToast(act, effect.title, effect.message, EmeraldToastManager.Type.SUCCESS)
                }
            }
            is NavigationEffect.LaunchExternalNavigation -> {
                launchGoogleMapsTurnByTurn(effect.latitude, effect.longitude, effect.destinationName)
            }
            is NavigationEffect.RequestLocationPermission -> {
                checkAndRequestPermissions()
            }
        }
    }

    private fun launchGoogleMapsTurnByTurn(lat: Double, lng: Double, name: String) {
        try {
            val gmmIntentUri = Uri.parse("google.navigation:q=$lat,$lng&mode=d")
            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
            mapIntent.setPackage("com.google.android.apps.maps")
            startActivity(mapIntent)
        } catch (e: Exception) {
            try {
                val browserUri = Uri.parse("https://www.google.com/maps/dir/?api=1&destination=$lat,$lng")
                startActivity(Intent(Intent.ACTION_VIEW, browserUri))
            } catch (ex: Exception) {
                activity?.let { act ->
                    EmeraldToastManager.showToast(act, "Navigation Error", "Could not launch map application.", EmeraldToastManager.Type.ERROR)
                }
            }
        }
    }

    override fun onStart() { super.onStart(); binding.navigationMapView.onStart() }
    override fun onResume() { super.onResume(); binding.navigationMapView.onResume() }
    override fun onPause() { super.onPause(); binding.navigationMapView.onPause() }
    override fun onStop() { super.onStop(); binding.navigationMapView.onStop() }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        _binding?.navigationMapView?.onSaveInstanceState(outState)
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        mapLibreMap?.clear()
        mapLibreMap = null
        mapManager.detachMap()
        _binding?.navigationMapView?.onDestroy()
        // Restore bottom navigation bar when exiting navigation screen
        activity?.findViewById<View>(R.id.inc_main_bottom_nav)?.visibility = View.VISIBLE
        super.onDestroyView()
        _binding = null
    }

    override fun onLowMemory() {
        super.onLowMemory()
        _binding?.navigationMapView?.onLowMemory()
    }
}
