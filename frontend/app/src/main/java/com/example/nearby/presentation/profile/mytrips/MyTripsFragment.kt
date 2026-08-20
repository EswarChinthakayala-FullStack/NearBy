package com.example.nearby.presentation.profile.mytrips

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.nearby.R
import com.example.nearby.databinding.FragmentMyTripsBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.profile.mytrips.adapter.TripAdapter
import com.example.nearby.presentation.profile.mytrips.adapter.TripFilterAdapter
import com.example.nearby.presentation.profile.mytrips.dialog.DeleteTripConfirmationDialog
import com.example.nearby.presentation.profile.mytrips.dialog.MyTripsFilterDrawer
import com.example.nearby.presentation.profile.mytrips.model.TripDomainModel
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MyTripsFragment : Fragment() {

    private var _binding: FragmentMyTripsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MyTripsViewModel by viewModels()

    private lateinit var tripAdapter: TripAdapter
    private lateinit var filterAdapter: TripFilterAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMyTripsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        setupToolbar()
        setupCategoryFilters()
        setupRecyclerView()
        setupSearch()
        setupSwipeRefresh()
        setupClickListeners()
        observeUiState()
    }

    private fun setupToolbar() {
        binding.myTripsToolbar.setTitle("My Trips & Itineraries")
        binding.myTripsToolbar.setBackButtonVisible(true)
        binding.myTripsToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }

        binding.myTripsToolbar.setActionIcon(R.drawable.ic_filter)
        binding.myTripsToolbar.setOnActionClickListener {
            openFilterDrawer()
        }

        binding.myTripsToolbar.setSecondaryAction(R.drawable.ic_refresh) {
            viewModel.loadTrips(isRefreshing = true)
        }
    }

    private fun openFilterDrawer() {
        val drawer = MyTripsFilterDrawer(
            context = requireContext(),
            layoutInflater = layoutInflater,
            onApply = { filterState -> viewModel.onFilterStateChanged(filterState) },
            onReset = { viewModel.onResetFilters() }
        )
        drawer.open(viewModel.uiState.value.filterState)
    }

    private fun setupCategoryFilters() {
        filterAdapter = TripFilterAdapter { category ->
            viewModel.onCategorySelected(category)
        }
        binding.rvTripCategoryFilters.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        binding.rvTripCategoryFilters.adapter = filterAdapter
    }

    private fun setupRecyclerView() {
        tripAdapter = TripAdapter(
            onOpenTripClick = { trip -> openTripDetail(trip) },
            onDeleteClick = { trip -> confirmDeleteTrip(trip) },
            onShareClick = { trip -> shareTripDetails(trip) },
            onToggleExpand = { trip -> viewModel.toggleExpandPrompt(trip) }
        )
        binding.rvTrips.layoutManager = LinearLayoutManager(requireContext())
        binding.rvTrips.adapter = tripAdapter
    }

    private fun setupSearch() {
        binding.searchViewTrips.setHint("Search destination, title, theme...")
        binding.searchViewTrips.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.onSearchQueryChanged(s?.toString() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.searchViewTrips.setOnFilterClickListener {
            openFilterDrawer()
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setColorSchemeResources(R.color.emerald_500)
        binding.swipeRefreshLayout.setOnRefreshListener {
            viewModel.loadTrips(isRefreshing = true)
        }
    }

    private fun setupClickListeners() {
        binding.btnCreateTrip.setOnClickListener {
            navigateToChat()
        }

        binding.fabCreateTripMain.setOnClickListener {
            navigateToChat()
        }
    }

    private fun observeUiState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    renderUiState(state)
                }
            }
        }
    }

    private fun renderUiState(state: MyTripsUiState) {
        binding.swipeRefreshLayout.isRefreshing = state.isRefreshing

        // Shimmer vs List
        if (state.isLoading && !state.isRefreshing) {
            binding.layoutShimmerTripsContainer.root.visibility = View.VISIBLE
            binding.rvTrips.visibility = View.GONE
            binding.layoutEmptyTrips.visibility = View.GONE
        } else {
            binding.layoutShimmerTripsContainer.root.visibility = View.GONE

            if (state.filteredTrips.isEmpty()) {
                binding.rvTrips.visibility = View.GONE
                binding.layoutEmptyTrips.visibility = View.VISIBLE
            } else {
                binding.rvTrips.visibility = View.VISIBLE
                binding.layoutEmptyTrips.visibility = View.GONE
                tripAdapter.submitList(state.filteredTrips)
            }
        }

        // Category Filter Chips
        filterAdapter.submitCategories(state.categories, state.filterState.selectedCategory)

        // Statistics Cards
        binding.tvStatTotalTrips.text = state.totalTrips.toString()
        binding.tvStatCitiesVisited.text = state.totalDestinations.toString()
        binding.tvStatPlacesPlanned.text = state.totalPlacesPlanned.toString()
        binding.tvStatTravelDays.text = state.totalTravelDays.toString()

        // Count Header
        binding.tvTripsCountLabel.text = "My Itineraries (${state.filteredTrips.size})"
        binding.tvTripSortIndicator.text = "Sorted by ${state.filterState.sortBy}"

        // Toast Errors
        state.errorMessage?.let { error ->
            activity?.let {
                EmeraldToastManager.showToast(it, "Trips Error", error, EmeraldToastManager.Type.ERROR)
            }
        }
    }

    private fun openTripDetail(trip: TripDomainModel) {
        if (trip.uuid.isBlank()) {
            activity?.let {
                EmeraldToastManager.showToast(it, "Invalid Trip", "Cannot open trip without valid identifier.", EmeraldToastManager.Type.WARNING)
            }
            return
        }

        val bundle = bundleOf(
            "itinerary_uuid" to trip.uuid,
            "itinerary_id" to trip.uuid,
            "itineraryId" to trip.uuid
        )

        try {
            findNavController().navigate(R.id.action_myTrips_to_detail, bundle)
        } catch (e: Exception) {
            Log.e("MyTripsFragment", "Navigation action_myTrips_to_detail failed: ${e.message}", e)
            try {
                findNavController().navigate(R.id.itineraryDetailFragment, bundle)
            } catch (ex: Exception) {
                Log.e("MyTripsFragment", "Direct navigation to itineraryDetailFragment failed: ${ex.message}", ex)
            }
        }
    }

    private fun confirmDeleteTrip(trip: TripDomainModel) {
        val dialog = DeleteTripConfirmationDialog(
            context = requireContext(),
            layoutInflater = layoutInflater,
            onConfirmDelete = { item ->
                viewModel.deleteTrip(item) { success, msg ->
                    activity?.let { act ->
                        val type = if (success) EmeraldToastManager.Type.SUCCESS else EmeraldToastManager.Type.ERROR
                        EmeraldToastManager.showToast(act, "Delete Trip", msg, type)
                    }
                }
            }
        )
        dialog.show(trip)
    }

    private fun shareTripDetails(trip: TripDomainModel) {
        val titleText = trip.title.ifEmpty { "${trip.daysCount}-Day Trip to ${trip.destination}" }
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, titleText)
            putExtra(Intent.EXTRA_TEXT, "Check out my AI travel itinerary for ${trip.destination}: \"${trip.prompt}\" planned with Nearby Travel App!")
        }
        startActivity(Intent.createChooser(shareIntent, "Share Itinerary"))
    }

    private fun navigateToChat() {
        try {
            findNavController().navigate(R.id.action_myTrips_to_chat)
        } catch (e: Exception) {
            try {
                findNavController().navigate(R.id.aiItineraryChatFragment)
            } catch (ignored: Exception) {}
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
