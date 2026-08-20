package com.example.nearby.presentation.discovery

import android.Manifest
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.widget.SwitchCompat
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
import com.example.nearby.databinding.FragmentDiscoveryListingBinding
import com.example.nearby.designsystem.CustomBottomDrawer
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.home.PlaceItem
import com.example.nearby.presentation.navigation.NavigationLocationManager
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
open class DiscoveryListingFragment(private val type: String) : Fragment() {

    private var _binding: FragmentDiscoveryListingBinding? = null
    private val binding get() = _binding!!

    private val viewModel: DiscoveryListingViewModel by viewModels()

    @Inject
    lateinit var navigationLocationManager: NavigationLocationManager

    private var placesAdapter: PlaceListAdapter? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDiscoveryListingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { com.example.nearby.utils.WindowInsetsHelper.setupEdgeToEdge(it) }
        com.example.nearby.utils.WindowInsetsHelper.applyStatusBarTopPadding(binding.layoutPremiumToolbar.root)

        setupToolbar()
        setupRecyclerView()
        setupSearchAndFilters()
        observeUiState()

        // Fetch location and load data
        viewLifecycleOwner.lifecycleScope.launch {
            val latLng = navigationLocationManager.getInitialUserLocation(requireContext())
            viewModel.init(type, latLng.latitude, latLng.longitude)
        }
    }

    private fun setupToolbar() {
        val title = when (type) {
            "trending" -> "Trending Destinations"
            "recommended" -> "Recommended For You"
            "popular" -> "Popular Destinations"
            "nearby" -> "Nearby Attractions"
            else -> "Explore Places"
        }
        
        binding.layoutPremiumToolbar.tvToolbarTitle.text = title
        binding.layoutPremiumToolbar.btnToolbarBack.apply {
            visibility = View.VISIBLE
            setOnClickListener {
                findNavController().popBackStack()
            }
        }
    }

    private fun setupRecyclerView() {
        placesAdapter = PlaceListAdapter(emptyList(), { place ->
            val bundle = Bundle().apply {
                putString("placeId", place.slug)
            }
            findNavController().navigate(R.id.placeDetailFragment, bundle)
        }, { place ->
            viewModel.toggleFavorite(place)
        })

        binding.rvPlacesList.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = placesAdapter

            addOnScrollListener(object : RecyclerView.OnScrollListener() {
                override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                    val lm = layoutManager as LinearLayoutManager
                    val totalItemCount = lm.itemCount
                    val lastVisibleItem = lm.findLastVisibleItemPosition()
                    
                    if (totalItemCount > 0 && lastVisibleItem >= totalItemCount - 3) {
                        viewModel.loadData(isRefresh = false)
                    }
                }
            })
        }

        binding.swipeRefresh.setOnRefreshListener {
            viewModel.loadData(isRefresh = true)
        }
    }

    private fun setupSearchAndFilters() {
        binding.etSearchInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                viewModel.searchQuery = s?.toString().orEmpty()
                viewModel.loadData(isRefresh = true)
            }
        })

        binding.btnVoiceInput.setOnClickListener {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Voice Search", "Listening for destination...", EmeraldToastManager.Type.INFO)
            }
        }

        binding.btnFilterTrigger.setOnClickListener {
            openFilterDrawer()
        }
    }

    private fun openFilterDrawer() {
        try {
            val drawer = CustomBottomDrawer(requireContext())
            val filterView = layoutInflater.inflate(R.layout.layout_filter_drawer, null, false)
            drawer.setTitle("Filter & Sort Destinations")
            drawer.setCustomContentView(filterView)

            val rgSortBy = filterView.findViewById<RadioGroup>(R.id.rgSortBy)
            val rgRating = filterView.findViewById<RadioGroup>(R.id.rgRating)
            val switchOpenNow = filterView.findViewById<SwitchCompat>(R.id.switchOpenNow)
            val btnApply = filterView.findViewById<TextView>(R.id.btnApplyFilters)
            val btnReset = filterView.findViewById<TextView>(R.id.btnResetFilters)

            // Preset values based on current model states
            when (viewModel.sortBy) {
                "Alphabetical" -> filterView.findViewById<RadioButton>(R.id.rbSortAlphabetical)?.isChecked = true
                "Rating" -> filterView.findViewById<RadioButton>(R.id.rbSortRating)?.isChecked = true
                else -> filterView.findViewById<RadioButton>(R.id.rbSortRecentlySaved)?.isChecked = true
            }

            when (viewModel.minRating) {
                4.0f -> filterView.findViewById<RadioButton>(R.id.rbRating4Plus)?.isChecked = true
                4.5f -> filterView.findViewById<RadioButton>(R.id.rbRating45Plus)?.isChecked = true
                else -> filterView.findViewById<RadioButton>(R.id.rbRatingAny)?.isChecked = true
            }

            switchOpenNow?.isChecked = viewModel.openNowOnly

            btnApply?.setOnClickListener {
                viewModel.sortBy = when (rgSortBy?.checkedRadioButtonId) {
                    R.id.rbSortAlphabetical -> "Alphabetical"
                    R.id.rbSortRating -> "Rating"
                    else -> "Recently Saved"
                }

                viewModel.minRating = when (rgRating?.checkedRadioButtonId) {
                    R.id.rbRating4Plus -> 4.0f
                    R.id.rbRating45Plus -> 4.5f
                    else -> null
                }

                viewModel.openNowOnly = switchOpenNow?.isChecked ?: false
                
                updateFilterChips()
                viewModel.loadData(isRefresh = true)
                drawer.dismissWithAnimation()
            }

            btnReset?.setOnClickListener {
                viewModel.sortBy = null
                viewModel.minRating = null
                viewModel.openNowOnly = false
                
                updateFilterChips()
                viewModel.loadData(isRefresh = true)
                drawer.dismissWithAnimation()
            }

            drawer.show()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun updateFilterChips() {
        binding.layoutFilterChipsContainer.removeAllViews()
        val activeFilters = mutableListOf<String>()
        
        viewModel.sortBy?.let { activeFilters.add("Sort: $it") }
        viewModel.minRating?.let { activeFilters.add("Rating >= $it ★") }
        if (viewModel.openNowOnly) {
            activeFilters.add("Open Now")
        }

        if (activeFilters.isNotEmpty()) {
            binding.scrollFilterChips.visibility = View.VISIBLE
            for (f in activeFilters) {
                val chip = LayoutInflater.from(requireContext()).inflate(R.layout.item_filter_chip, binding.layoutFilterChipsContainer, false) as TextView
                chip.text = f
                binding.layoutFilterChipsContainer.addView(chip)
            }
        } else {
            binding.scrollFilterChips.visibility = View.GONE
        }
    }

    private fun observeUiState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.places.collect { list ->
                        placesAdapter?.updateItems(list)
                        binding.layoutEmpty.root.visibility = if (list.isEmpty() && !viewModel.isLoading.value) View.VISIBLE else View.GONE
                    }
                }

                launch {
                    viewModel.isLoading.collect { loading ->
                        binding.layoutLoading.root.visibility = if (loading) View.VISIBLE else View.GONE
                    }
                }

                launch {
                    viewModel.isRefreshing.collect { refreshing ->
                        binding.swipeRefresh.isRefreshing = refreshing
                    }
                }

                launch {
                    viewModel.error.collect { err ->
                        if (err != null) {
                            binding.layoutError.root.visibility = View.VISIBLE
                            binding.layoutError.errorMessage.text = err
                            binding.layoutError.btnRetry.setOnClickListener {
                                viewModel.loadData(isRefresh = true)
                            }
                        } else {
                            binding.layoutError.root.visibility = View.GONE
                        }
                    }
                }
            }
        }
    }

    // List Adapter
    private class PlaceListAdapter(
        private var items: List<PlaceItem>,
        private val onClick: (PlaceItem) -> Unit,
        private val onFavClick: (PlaceItem) -> Unit
    ) : RecyclerView.Adapter<PlaceListAdapter.ViewHolder>() {

        inner class ViewHolder(val v: View) : RecyclerView.ViewHolder(v) {
            val ivCover: ImageView = v.findViewById(R.id.iv_place_thumbnail)
            val tvName: TextView = v.findViewById(R.id.tv_place_name)
            val tvCategory: TextView = v.findViewById(R.id.tv_place_category)
            val tvRating: TextView = v.findViewById(R.id.tv_place_rating)
            val tvDistance: TextView = v.findViewById(R.id.tv_place_distance)
            val btnFav: ImageButton = v.findViewById(R.id.btn_favorite)
        }

        fun updateItems(newItems: List<PlaceItem>) {
            items = newItems
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val v = LayoutInflater.from(parent.context).inflate(R.layout.item_place_card, parent, false)
            val density = parent.resources.displayMetrics.density
            v.layoutParams = ViewGroup.MarginLayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                leftMargin = (16 * density).toInt()
                rightMargin = (16 * density).toInt()
                bottomMargin = (20 * density).toInt()
            }
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

            holder.btnFav.setOnClickListener { onFavClick(item) }
            holder.v.setOnClickListener { onClick(item) }
        }

        override fun getItemCount(): Int = items.size
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        binding.rvPlacesList.adapter = null
        super.onDestroyView()
        _binding = null
    }
}
