package com.example.nearby.presentation.explore

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.OvershootInterpolator
import android.view.inputmethod.EditorInfo
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import androidx.core.widget.addTextChangedListener
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.paging.LoadState
import androidx.paging.PagingDataAdapter
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import coil3.request.crossfade
import com.example.nearby.R
import com.example.nearby.databinding.FragmentExploreBinding
import com.example.nearby.databinding.ItemAppliedFilterChipBinding
import com.example.nearby.databinding.ItemExplorePlaceCardBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.home.PlaceItem
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ExploreFragment : Fragment() {

    private var _binding: FragmentExploreBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ExploreViewModel by viewModels()

    private lateinit var placesAdapter: ExplorePlacesAdapter
    private lateinit var appliedChipsAdapter: AppliedChipsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentExploreBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        setupWindowInsets()
        setupAdapters()
        setupListeners()
        observeViewModel()
    }

    private fun setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { _, insets ->
            val statusBarTop = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
            val navBarHeight = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
            val safeBottom = if (navBarHeight > 0) navBarHeight + (12 * resources.displayMetrics.density).toInt() else (16 * resources.displayMetrics.density).toInt()

            binding.layoutExploreToolbar.updatePadding(top = statusBarTop)
            binding.rvExplorePlaces.updatePadding(bottom = safeBottom + (80 * resources.displayMetrics.density).toInt())
            
            binding.layoutFilterDrawer.updatePadding(
                bottom = navBarHeight + (92 * resources.displayMetrics.density).toInt()
            )
            
            insets
        }
        ViewCompat.requestApplyInsets(binding.root)
    }

    private fun setupAdapters() {
        // Read view preference from SharedPreferences
        val prefs = requireContext().getSharedPreferences("explore_prefs", Context.MODE_PRIVATE)
        val isGrid = prefs.getBoolean("is_grid_view", false)
        viewModel.setViewMode(isGrid)

        placesAdapter = ExplorePlacesAdapter(
            onItemClicked = { place ->
                val bundle = Bundle().apply {
                    putString("placeId", place.id)
                }
                findNavController().navigate(R.id.placeDetailFragment, bundle)
            },
            onFavClicked = { place ->
                viewModel.dispatchAction(ExploreAction.OnBookmarkToggled(place.slug))
            },
            onRouteClicked = { place ->
                val bundle = Bundle().apply {
                    putString("placeId", place.id)
                    putString("name", place.name)
                    putString("category", place.category)
                    putString("rating", place.rating)
                    putDouble("latitude", place.latitude)
                    putDouble("longitude", place.longitude)
                    putString("heroImage", place.imageUrl)
                }
                findNavController().navigate(R.id.navigationFragment, bundle)
            }
        )

        binding.rvExplorePlaces.apply {
            layoutManager = if (isGrid) GridLayoutManager(requireContext(), 2) else LinearLayoutManager(requireContext())
            adapter = placesAdapter
        }

        appliedChipsAdapter = AppliedChipsAdapter { chip ->
            viewModel.dispatchAction(ExploreAction.OnFilterChipRemoved(chip.id))
        }
        binding.rvAppliedChips.adapter = appliedChipsAdapter

        placesAdapter.addLoadStateListener { loadState ->
            val isLoading = loadState.refresh is LoadState.Loading
            val isError = loadState.refresh is LoadState.Error && placesAdapter.itemCount == 0
            val isEmpty = loadState.refresh is LoadState.NotLoading && placesAdapter.itemCount == 0

            binding.progressExploreLoading.visibility = if (isLoading) View.VISIBLE else View.GONE
            binding.layoutEmptyExplore.visibility = if (isEmpty) View.VISIBLE else View.GONE
            binding.layoutErrorExplore.visibility = if (isError) View.VISIBLE else View.GONE
        }
    }

    private fun setupListeners() {
        binding.btnGridListToggle.setOnClickListener {
            viewModel.toggleViewMode()
        }

        binding.btnExploreToolbarFilter.setOnClickListener {
            viewModel.dispatchAction(ExploreAction.OnFilterFabClicked)
        }

        binding.viewDimOverlay.setOnClickListener {
            viewModel.closeFilterDrawer()
        }

        binding.btnRetryExplore.setOnClickListener {
            placesAdapter.retry()
        }

        binding.etExploreSearch.setOnEditorActionListener { v, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH || actionId == EditorInfo.IME_ACTION_DONE) {
                viewModel.dispatchAction(ExploreAction.OnSearchQueryChanged(v.text.toString()))
                true
            } else {
                false
            }
        }

        binding.etExploreSearch.addTextChangedListener { text ->
            // Trigger simple inline filter updates
            if (text != null && text.toString().isBlank()) {
                viewModel.dispatchAction(ExploreAction.OnSearchQueryChanged(""))
            }
        }

        binding.btnApplyFilters.setOnClickListener {
            val filter = buildFilterStateFromUi()
            viewModel.dispatchAction(ExploreAction.OnFilterApplied(filter))
        }

        binding.btnResetFilters.setOnClickListener {
            viewModel.dispatchAction(ExploreAction.OnClearAllFilters)
            resetDrawerUi()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        renderCategories(state.categories)
                        appliedChipsAdapter.submitList(state.activeFilterChips)
                        
                        // Toggle Grid/List layout
                        val isGrid = state.isGridView
                        val layout = if (isGrid) GridLayoutManager(requireContext(), 2) else LinearLayoutManager(requireContext())
                        binding.rvExplorePlaces.layoutManager = layout
                        
                        // Save layout preference
                        requireContext().getSharedPreferences("explore_prefs", Context.MODE_PRIVATE)
                            .edit()
                            .putBoolean("is_grid_view", isGrid)
                            .apply()

                        binding.btnGridListToggle.setImageResource(
                            if (isGrid) R.drawable.ic_list else R.drawable.ic_grid
                        )

                        binding.tvExploreResultsCount.text = "${placesAdapter.itemCount} Places Found"
                        
                        // Display Drawer
                        toggleFilterDrawer(state.isFilterDrawerVisible)
                    }
                }
                launch {
                    viewModel.pagedPlaces.collectLatest { pagingData ->
                        placesAdapter.submitData(pagingData)
                    }
                }
                launch {
                    viewModel.eventFlow.collect { event ->
                        when (event) {
                            is ExploreEvent.NavigateToPlaceDetails -> {
                                val bundle = Bundle().apply {
                                    putString("placeId", event.placeId)
                                }
                                findNavController().navigate(R.id.placeDetailFragment, bundle)
                            }
                            is ExploreEvent.ShowToast -> {
                                EmeraldToastManager.showToast(
                                    requireActivity(),
                                    event.title,
                                    event.message,
                                    EmeraldToastManager.Type.INFO
                                )
                            }
                            else -> {}
                        }
                    }
                }
            }
        }
    }

    private fun renderCategories(categories: List<CategoryItem>) {
        binding.exploreCategoriesContainer.removeAllViews()
        categories.forEach { category ->
            val chip = TextView(requireContext()).apply {
                text = category.name
                setTextAppearance(R.style.Typography_Caption)
                setPadding(36, 18, 36, 18)
                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { setMargins(0, 0, 16, 0) }
                layoutParams = params

                if (category.isSelected) {
                    setBackgroundResource(R.drawable.bg_button_primary)
                    setTextColor(ContextCompat.getColor(context, R.color.white))
                } else {
                    setBackgroundResource(R.drawable.bg_chip)
                    setTextColor(ContextCompat.getColor(context, R.color.text_primary))
                }

                setOnClickListener {
                    viewModel.dispatchAction(ExploreAction.OnCategorySelected(category.name))
                }
            }
            binding.exploreCategoriesContainer.addView(chip)
        }
    }

    private fun toggleFilterDrawer(show: Boolean) {
        val drawer = binding.layoutFilterDrawer
        val overlay = binding.viewDimOverlay
        if (show) {
            overlay.visibility = View.VISIBLE
            drawer.visibility = View.VISIBLE
            drawer.translationY = 1200f
            drawer.animate()
                .translationY(0f)
                .setDuration(400)
                .setInterpolator(OvershootInterpolator(0.8f))
                .start()
        } else {
            drawer.animate()
                .translationY(1200f)
                .setDuration(300)
                .withEndAction {
                    drawer.visibility = View.GONE
                    overlay.visibility = View.GONE
                }
                .start()
        }
    }

    private fun buildFilterStateFromUi(): ExploreFilterState {
        val selectedCategory = viewModel.uiState.value.filterState.selectedCategory
        
        val distanceText = when (binding.rgDistanceFilters.checkedRadioButtonId) {
            R.id.rb_dist_5 -> "5 km"
            R.id.rb_dist_10 -> "10 km"
            R.id.rb_dist_25 -> "25 km"
            R.id.rb_dist_50 -> "50 km"
            else -> "Anywhere"
        }

        val ratingText = when (binding.rgRatingFilters.checkedRadioButtonId) {
            R.id.rb_rating_3 -> "3+"
            R.id.rb_rating_4 -> "4+"
            R.id.rb_rating_45 -> "4.5+"
            else -> "Any"
        }

        val entryFeeText = when (binding.rgFeeFilters.checkedRadioButtonId) {
            R.id.rb_fee_free -> "Free"
            R.id.rb_fee_paid -> "Paid"
            else -> "Any"
        }

        val crowdLevelText = when (binding.rgCrowdFilters.checkedRadioButtonId) {
            R.id.rb_crowd_quiet -> "Quiet"
            R.id.rb_crowd_moderate -> "Moderate"
            R.id.rb_crowd_busy -> "Busy"
            else -> "Any"
        }

        val sortText = when (binding.rgSortOptions.checkedRadioButtonId) {
            R.id.rb_sort_nearest -> "Nearest"
            R.id.rb_sort_rating -> "Highest Rated"
            R.id.rb_sort_popular -> "Most Popular"
            else -> "Relevance"
        }

        return ExploreFilterState(
            selectedCategory = selectedCategory,
            distanceText = distanceText,
            ratingText = ratingText,
            entryFeeText = entryFeeText,
            crowdLevelText = crowdLevelText,
            sortText = sortText
        )
    }

    private fun resetDrawerUi() {
        binding.rgDistanceFilters.check(R.id.rb_dist_anywhere)
        binding.rgRatingFilters.check(R.id.rb_rating_any)
        binding.rgFeeFilters.check(R.id.rb_fee_any)
        binding.rgCrowdFilters.check(R.id.rb_crowd_any)
        binding.rgSortOptions.check(R.id.rb_sort_relevance)
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        binding.rvExplorePlaces.adapter = null
        binding.rvAppliedChips.adapter = null
        super.onDestroyView()
        _binding = null
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Inner Adapters
    // ═════════════════════════════════════════════════════════════════════════

    private class ExplorePlacesAdapter(
        private val onItemClicked: (PlaceItem) -> Unit,
        private val onFavClicked: (PlaceItem) -> Unit,
        private val onRouteClicked: (PlaceItem) -> Unit
    ) : PagingDataAdapter<PlaceItem, ExplorePlacesAdapter.ViewHolder>(PlaceDiffCallback) {

        inner class ViewHolder(val binding: ItemExplorePlaceCardBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = ItemExplorePlaceCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = getItem(position) ?: return
            holder.binding.tvExploreCardName.text = item.name
            holder.binding.tvExploreCardCategory.text = item.category.uppercase()
            holder.binding.tvExploreCardRating.text = item.rating
            holder.binding.tvExploreCardDistance.text = "${item.distance} • ${item.city}"
            holder.binding.tvExploreCardOpenStatus.text = item.openStatus

            if (item.imageUrl.isNotBlank()) {
                holder.binding.ivExploreThumbnail.load(item.imageUrl) {
                    crossfade(true)
                }
            }

            val favRes = if (item.isFavorite) R.drawable.ic_heart_filled else R.drawable.ic_heart
            holder.binding.btnExploreCardFavorite.setImageResource(favRes)

            holder.binding.btnExploreCardFavorite.setOnClickListener { onFavClicked(item) }
            holder.binding.btnExploreCardRoute.setOnClickListener { onRouteClicked(item) }
            holder.itemView.setOnClickListener { onItemClicked(item) }
        }

        object PlaceDiffCallback : DiffUtil.ItemCallback<PlaceItem>() {
            override fun areItemsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem.id == newItem.id
            override fun areContentsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem == newItem
        }
    }

    private class AppliedChipsAdapter(
        private val onRemoveClicked: (FilterChipItem) -> Unit
    ) : RecyclerView.Adapter<AppliedChipsAdapter.ViewHolder>() {

        private var items: List<FilterChipItem> = emptyList()

        inner class ViewHolder(val binding: ItemAppliedFilterChipBinding) : RecyclerView.ViewHolder(binding.root)

        fun submitList(newItems: List<FilterChipItem>) {
            items = newItems
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = ItemAppliedFilterChipBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.binding.tvChipLabel.text = item.label
            holder.binding.ivChipRemove.setOnClickListener { onRemoveClicked(item) }
        }

        override fun getItemCount(): Int = items.size
    }
}
