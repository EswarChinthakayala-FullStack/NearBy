package com.example.nearby.presentation.map

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.ViewGroup.MarginLayoutParams
import android.view.animation.OvershootInterpolator
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updateLayoutParams
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.nearby.R
import com.example.nearby.common.Logger
import com.example.nearby.databinding.FragmentMapBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.tourismguide.app.data.remote.api.DirectionsApiService
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.MapLibreMap
import javax.inject.Inject
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

@AndroidEntryPoint
class MapFragment : Fragment() {

    private var _binding: FragmentMapBinding? = null
    private val binding get() = _binding!!

    @Inject lateinit var logger: Logger
    @Inject lateinit var mapManager: MapManager
    @Inject lateinit var directionsApiService: DirectionsApiService

    private var isDarkModeActive: Boolean = false
    private var isTrafficEnabled: Boolean = false
    private var isNavigationMode: Boolean = false
    private var selectedTransportMode: String = "Drive"

    private var targetLatitude: Double = 0.0
    private var targetLongitude: Double = 0.0
    private var targetPlaceName: String = ""

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMapBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val nightMask = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
        isDarkModeActive = (nightMask == android.content.res.Configuration.UI_MODE_NIGHT_YES)

        targetLatitude = arguments?.getDouble("latitude") ?: 0.0
        targetLongitude = arguments?.getDouble("longitude") ?: 0.0
        targetPlaceName = arguments?.getString("placeName") ?: ""

        setupWindowInsets()
        binding.mapView.onCreate(savedInstanceState)

        setupSearchBar()
        setupRouteSearchPanel()
        setupTransportModeSelector()
        setupMapControls()
        setupRouteSummarySheet()
        setupLayerSheet()
        setupExploreWeather()

        binding.mapView.getMapAsync { map ->
            mapManager.attachMap(requireContext(), map, isDarkModeActive) {
                setupMapListeners(map)
                if (targetLatitude != 0.0 && targetLongitude != 0.0) {
                    calculateAndRenderNavigationRoute(targetLatitude, targetLongitude, targetPlaceName)
                }
            }
        }
    }

    private fun setupWindowInsets() {
        val resourceStatusBarHeight = getSystemStatusBarHeight()

        ViewCompat.setOnApplyWindowInsetsListener(binding.mapRootContainer) { _, insets ->
            val statusBarInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
            val cutoutInsets = insets.getInsets(WindowInsetsCompat.Type.displayCutout()).top
            val navBarInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom

            val actualTopInset = maxOf(statusBarInsets, cutoutInsets, resourceStatusBarHeight)
            val actualBottomInset = if (navBarInsets > 0) navBarInsets else 16.dpToPx()
            val safeTopMargin = actualTopInset + 12.dpToPx()

            binding.incSearchBar.searchBarContainer.updateLayoutParams<MarginLayoutParams> {
                topMargin = safeTopMargin
            }
            binding.navigationModeContainer.updateLayoutParams<MarginLayoutParams> {
                topMargin = safeTopMargin
            }
            binding.compassWidget.updateLayoutParams<MarginLayoutParams> {
                topMargin = safeTopMargin + 68.dpToPx()
            }
            binding.bottomSectionContainer.updateLayoutParams<MarginLayoutParams> {
                bottomMargin = actualBottomInset + 12.dpToPx()
            }

            insets
        }

        ViewCompat.requestApplyInsets(binding.mapRootContainer)
    }

    private fun getSystemStatusBarHeight(): Int {
        var result = 0
        val resourceId = resources.getIdentifier("status_bar_height", "dimen", "android")
        if (resourceId > 0) {
            result = resources.getDimensionPixelSize(resourceId)
        }
        return result
    }

    private fun calculateAndRenderNavigationRoute(destLat: Double, destLng: Double, name: String) {
        switchToNavigationMode()

        // User live location (Defaulting to New Delhi center for simulation)
        val userLat = 28.6139
        val userLng = 77.2090
        val userPos = LatLng(userLat, userLng)
        val destPos = LatLng(destLat, destLng)

        val distanceKm = calculateHaversineDistanceKm(userLat, userLng, destLat, destLng)
        val durationMins = (distanceKm * 2.5).toInt().coerceAtLeast(8)

        val routePoints = generateIntermediateWaypoints(userPos, destPos)

        mapManager.clearAll()
        mapManager.addMarker(userPos, "My Location", "GPS Live Fix")
        mapManager.addMarker(destPos, name.ifEmpty { "Destination" }, "Target Point")
        mapManager.drawRoutePolyline(routePoints, true)

        mapManager.fitCameraToBounds(routePoints, 120)

        // Show Route Summary Sheet
        val sheet = binding.incRouteSummary.routeSummarySheetContainer
        sheet.visibility = View.VISIBLE
        sheet.alpha = 1f
        sheet.translationY = 0f

        binding.incRouteSummary.tvRouteDestinationName.text = name.ifEmpty { "Destination" }
        binding.incRouteSummary.tvRouteEta.text = "$durationMins min"
        binding.incRouteSummary.tvRouteDistance.text = "(${String.format("%.1f", distanceKm)} km) • OSRM Driving Route"

        binding.incRoutePanel.etFromLocation.setText("My Location")
        binding.incRoutePanel.etToDestination.setText(name)

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = directionsApiService.getDirections(userLat, userLng, destLat, destLng)
                if (res.isSuccessful && res.body()?.data != null) {
                    val d = res.body()!!.data!!
                    binding.incRouteSummary.tvRouteEta.text = "${d.finalDurationMinutes} min"
                    binding.incRouteSummary.tvRouteDistance.text = "(${String.format("%.1f", d.finalDistanceKm)} km) • OSRM Driving Route"
                }
            } catch (e: Exception) {
                logger.w("Directions API call note: ${e.message}")
            }
        }
    }

    private fun generateIntermediateWaypoints(start: LatLng, end: LatLng, steps: Int = 12): List<LatLng> {
        val points = mutableListOf<LatLng>()
        for (i in 0..steps) {
            val fraction = i.toDouble() / steps.toDouble()
            val lat = start.latitude + (end.latitude - start.latitude) * fraction
            val lng = start.longitude + (end.longitude - start.longitude) * fraction
            // Slight curve perturbation for realistic map route
            val offset = sin(fraction * Math.PI) * 0.005
            points.add(LatLng(lat + offset, lng + offset))
        }
        return points
    }

    private fun calculateHaversineDistanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val r = 6371.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2) * sin(dLon / 2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return r * c
    }

    private fun switchToNavigationMode() {
        if (isNavigationMode) return
        isNavigationMode = true

        binding.incSearchBar.searchBarContainer.animate()
            .alpha(0f).translationY(-50f).setDuration(250)
            .withEndAction { binding.incSearchBar.searchBarContainer.visibility = View.GONE }
            .start()

        binding.incExploreWeather.exploreWeatherRow.visibility = View.GONE
        binding.compassWidget.visibility = View.GONE

        binding.navigationModeContainer.visibility = View.VISIBLE
        binding.navigationModeContainer.alpha = 0f
        binding.navigationModeContainer.translationY = -30f
        binding.navigationModeContainer.animate()
            .alpha(1f).translationY(0f).setDuration(300)
            .setInterpolator(OvershootInterpolator(0.8f))
            .start()
    }

    private fun switchToExploreMode() {
        if (!isNavigationMode) return
        isNavigationMode = false

        binding.navigationModeContainer.animate()
            .alpha(0f).translationY(-30f).setDuration(200)
            .withEndAction { binding.navigationModeContainer.visibility = View.GONE }
            .start()

        binding.incRouteSummary.routeSummarySheetContainer.visibility = View.GONE

        binding.incSearchBar.searchBarContainer.visibility = View.VISIBLE
        binding.incSearchBar.searchBarContainer.alpha = 0f
        binding.incSearchBar.searchBarContainer.translationY = -50f
        binding.incSearchBar.searchBarContainer.animate()
            .alpha(1f).translationY(0f).setDuration(300)
            .start()

        binding.incExploreWeather.exploreWeatherRow.visibility = View.VISIBLE
        binding.compassWidget.visibility = View.VISIBLE
    }

    private fun setupSearchBar() {
        binding.incSearchBar.etSearchPlaces.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                switchToNavigationMode()
                val searchText = binding.incSearchBar.etSearchPlaces.text.toString()
                if (searchText.isNotEmpty()) {
                    binding.incRoutePanel.etToDestination.setText(searchText)
                }
                binding.incRoutePanel.etToDestination.requestFocus()
                binding.incSearchBar.etSearchPlaces.clearFocus()
            }
        }

        binding.incSearchBar.btnHamburgerContainer.setOnClickListener {
            activity?.let {
                EmeraldToastManager.showToast(it, "Menu", "Navigation drawer coming soon", EmeraldToastManager.Type.INFO)
            }
        }

        binding.incSearchBar.btnVoiceContainer.setOnClickListener {
            activity?.let {
                EmeraldToastManager.showToast(it, "Voice Search", "Listening...", EmeraldToastManager.Type.INFO)
            }
        }

        binding.incSearchBar.ivProfileAvatar.setOnClickListener {
            activity?.let {
                EmeraldToastManager.showToast(it, "Profile", "Account settings", EmeraldToastManager.Type.INFO)
            }
        }
    }

    private fun setupRouteSearchPanel() {
        binding.incRoutePanel.btnSwapLocations.setOnClickListener { view ->
            view.animate()
                .rotationBy(180f)
                .setDuration(350)
                .setInterpolator(OvershootInterpolator(1.2f))
                .start()

            val tempFrom = binding.incRoutePanel.etFromLocation.text.toString()
            val tempTo = binding.incRoutePanel.etToDestination.text.toString()

            binding.incRoutePanel.etFromLocation.setText(tempTo)
            binding.incRoutePanel.etToDestination.setText(tempFrom)

            activity?.let {
                EmeraldToastManager.showToast(it, "Swapped", "Route recalculated", EmeraldToastManager.Type.INFO)
            }
        }

        binding.incRoutePanel.btnVoiceRoute.setOnClickListener {
            activity?.let {
                EmeraldToastManager.showToast(it, "Voice Search", "Listening...", EmeraldToastManager.Type.INFO)
            }
        }

        binding.incRoutePanel.etToDestination.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                if (!s.isNullOrEmpty() && s.length > 2 && targetLatitude == 0.0) {
                    showDemoRoute(s.toString())
                }
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun setupTransportModeSelector() {
        binding.incTransportMode.tabModeDrive.setOnClickListener { selectTransportTab("Drive") }
        binding.incTransportMode.tabModeBike.setOnClickListener { selectTransportTab("Bike") }
        binding.incTransportMode.tabModeCycle.setOnClickListener { selectTransportTab("Cycle") }
        binding.incTransportMode.tabModeWalk.setOnClickListener { selectTransportTab("Walk") }
    }

    private fun selectTransportTab(mode: String) {
        selectedTransportMode = mode

        val activeBg = ContextCompat.getDrawable(requireContext(), R.drawable.bg_button_primary)
        val activeColor = ContextCompat.getColor(requireContext(), R.color.white)
        val inactiveColor = ContextCompat.getColor(requireContext(), R.color.text_secondary)

        binding.incTransportMode.tabModeDrive.background = if (mode == "Drive") activeBg else null
        binding.incTransportMode.tabModeBike.background = if (mode == "Bike") activeBg else null
        binding.incTransportMode.tabModeCycle.background = if (mode == "Cycle") activeBg else null
        binding.incTransportMode.tabModeWalk.background = if (mode == "Walk") activeBg else null

        binding.incTransportMode.tvModeDrive.setTextColor(if (mode == "Drive") activeColor else inactiveColor)
        binding.incTransportMode.tvModeBike.setTextColor(if (mode == "Bike") activeColor else inactiveColor)
        binding.incTransportMode.tvModeCycle.setTextColor(if (mode == "Cycle") activeColor else inactiveColor)
        binding.incTransportMode.tvModeWalk.setTextColor(if (mode == "Walk") activeColor else inactiveColor)

        activity?.let {
            EmeraldToastManager.showToast(it, "Route Mode", "Switched to $mode", EmeraldToastManager.Type.INFO)
        }
    }

    private fun showDemoRoute(destinationName: String) {
        val userPos = LatLng(28.6139, 77.2090)
        val destPos = LatLng(28.5245, 77.1855)
        val routePoints = generateIntermediateWaypoints(userPos, destPos)

        mapManager.clearAll()
        mapManager.addMarker(userPos, "My Location", "GPS Live Fix")
        mapManager.addMarker(destPos, destinationName, "Destination")
        mapManager.drawRoutePolyline(routePoints, true)
        mapManager.fitCameraToBounds(routePoints, 120)

        val sheet = binding.incRouteSummary.routeSummarySheetContainer
        if (sheet.visibility != View.VISIBLE) {
            sheet.translationY = 100f
            sheet.alpha = 0f
            sheet.visibility = View.VISIBLE
            sheet.animate()
                .translationY(0f).alpha(1f).setDuration(400)
                .setInterpolator(OvershootInterpolator(0.8f))
                .start()
        }

        binding.incRouteSummary.tvRouteDestinationName.text = destinationName
        binding.incRouteSummary.tvRouteEta.text = "18 min"
        binding.incRouteSummary.tvRouteDistance.text = "(12.4 km) • OSRM Driving Route"
    }

    private fun setupRouteSummarySheet() {
        binding.incRouteSummary.btnStartNavigation.setOnClickListener { view ->
            view.animate()
                .scaleX(0.95f).scaleY(0.95f).setDuration(100)
                .withEndAction {
                    view.animate().scaleX(1f).scaleY(1f).setDuration(150)
                        .setInterpolator(OvershootInterpolator(2f)).start()
                }
                .start()

            activity?.let {
                EmeraldToastManager.showToast(it, "Turn-by-Turn Navigation", "Following Emerald driving route", EmeraldToastManager.Type.SUCCESS)
            }
        }
    }

    private fun setupExploreWeather() {
        binding.incExploreWeather.btnExploreNearby.setOnClickListener {
            switchToNavigationMode()
        }

        binding.incExploreWeather.weatherWidget.setOnClickListener {
            activity?.let {
                EmeraldToastManager.showToast(it, "Weather", "28°C with clear skies", EmeraldToastManager.Type.INFO)
            }
        }
    }

    private fun setupMapControls() {
        binding.btnZoomIn.setOnClickListener { mapManager.zoomIn() }
        binding.btnZoomOut.setOnClickListener { mapManager.zoomOut() }

        binding.btnRecenter.setOnClickListener {
            if (targetLatitude != 0.0 && targetLongitude != 0.0) {
                val points = generateIntermediateWaypoints(LatLng(28.6139, 77.2090), LatLng(targetLatitude, targetLongitude))
                mapManager.fitCameraToBounds(points, 120)
            } else {
                mapManager.flyToPosition(LatLng(28.6139, 77.2090), 14.5)
            }
            activity?.let {
                EmeraldToastManager.showToast(it, "Location Locked", "Centered route & GPS", EmeraldToastManager.Type.SUCCESS)
            }
        }

        binding.btnCompass.setOnClickListener {
            mapManager.resetCompassNorth()
            activity?.let {
                EmeraldToastManager.showToast(it, "Compass Reset", "Facing North", EmeraldToastManager.Type.INFO)
            }
        }

        binding.btnLayers.setOnClickListener {
            val sheet = binding.incLayerSheet.mapLayerSheetContainer
            sheet.visibility = if (sheet.visibility == View.VISIBLE) View.GONE else View.VISIBLE
        }

        binding.btnTraffic.setOnClickListener {
            isTrafficEnabled = !isTrafficEnabled
            activity?.let {
                val state = if (isTrafficEnabled) "Enabled" else "Disabled"
                EmeraldToastManager.showToast(it, "Live Traffic", "Traffic $state", EmeraldToastManager.Type.INFO)
            }
        }
    }

    private fun setupLayerSheet() {
        binding.incLayerSheet.chipLayerStandard.setOnClickListener {
            mapManager.syncThemeStyle(false)
            binding.incLayerSheet.mapLayerSheetContainer.visibility = View.GONE
        }
        binding.incLayerSheet.chipLayerNight.setOnClickListener {
            mapManager.syncThemeStyle(true)
            binding.incLayerSheet.mapLayerSheetContainer.visibility = View.GONE
        }
        binding.incLayerSheet.chipLayerSatellite.setOnClickListener {
            activity?.let {
                EmeraldToastManager.showToast(it, "Satellite", "Loading satellite tiles...", EmeraldToastManager.Type.INFO)
            }
            binding.incLayerSheet.mapLayerSheetContainer.visibility = View.GONE
        }
    }

    private fun setupMapListeners(map: MapLibreMap) {
        map.addOnMapClickListener { latLng ->
            if (!isNavigationMode) {
                switchToNavigationMode()
            }
            showDemoRoute("📍 ${String.format("%.4f", latLng.latitude)}, ${String.format("%.4f", latLng.longitude)}")
            true
        }
    }

    private fun Int.dpToPx(): Int = (this * resources.displayMetrics.density).toInt()

    override fun onStart() { super.onStart(); binding.mapView.onStart() }
    override fun onResume() { super.onResume(); binding.mapView.onResume() }
    override fun onPause() { super.onPause(); binding.mapView.onPause() }
    override fun onStop() { super.onStop(); binding.mapView.onStop() }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        _binding?.mapView?.onSaveInstanceState(outState)
    }

    override fun onDestroyView() {
        mapManager.detachMap()
        binding.mapView.onDestroy()
        super.onDestroyView()
        _binding = null
    }

    override fun onLowMemory() {
        super.onLowMemory()
        _binding?.mapView?.onLowMemory()
    }
}
