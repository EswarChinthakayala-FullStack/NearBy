package com.example.nearby.presentation.favorites

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
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
import com.example.nearby.databinding.FragmentFavoritesBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.favorites.adapter.FavoriteCategoryAdapter
import com.example.nearby.presentation.favorites.adapter.FavoritePlaceAdapter
import com.example.nearby.presentation.favorites.ui.filter.FavoritesFilterDrawer
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class FavoritesFragment : Fragment() {

    private var _binding: FragmentFavoritesBinding? = null
    private val binding get() = _binding!!

    private val viewModel: FavoritesViewModel by viewModels()

    private var categoryAdapter: FavoriteCategoryAdapter? = null
    private var placeAdapter: FavoritePlaceAdapter? = null
    private var filterDrawerController: FavoritesFilterDrawer? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentFavoritesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        setupToolbar()
        setupSearch()
        setupRecyclerViews()
        setupFilterDrawer()
        setupClickListeners()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.favoritesToolbar.setTitle("Saved Destinations")
        binding.favoritesToolbar.setSubtitle("0 Places Bookmarked")
        binding.favoritesToolbar.setBackButtonVisible(true)
        binding.favoritesToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }
        binding.favoritesToolbar.setOnActionClickListener {
            viewModel.onEvent(FavoritesEvent.Refresh)
        }
    }

    private fun setupSearch() {
        binding.searchViewSaved.setHint("Search saved places...")
        binding.searchViewSaved.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val query = s?.toString() ?: ""
                viewModel.onEvent(FavoritesEvent.SearchQueryChanged(query))
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.searchViewSaved.setOnFilterClickListener {
            filterDrawerController?.open()
        }
    }

    private fun setupRecyclerViews() {
        categoryAdapter = FavoriteCategoryAdapter { category ->
            viewModel.onEvent(FavoritesEvent.CategorySelected(category))
        }

        placeAdapter = FavoritePlaceAdapter(
            onItemClick = { fav ->
                val bundle = Bundle().apply {
                    putString("placeId", fav.placeId)
                    putString("placeName", fav.placeName)
                    putString("placeCategory", fav.placeCategory)
                }
                findNavController().navigate(R.id.placeDetailFragment, bundle)
            },
            onFavoriteToggle = { fav ->
                viewModel.onEvent(FavoritesEvent.ToggleFavoriteOptimistic(fav.placeId))
            },
            onNavigateClick = { fav ->
                val p = fav.place
                val lat = p?.latitude ?: 28.6139
                val lng = p?.longitude ?: 77.2090
                val rating = p?.avgRating ?: 4.5
                val bundle = Bundle().apply {
                    putString("placeId", fav.placeId)
                    putDouble("latitude", lat)
                    putDouble("longitude", lng)
                    putString("placeName", fav.placeName)
                    putString("placeCategory", fav.placeCategory)
                    putString("rating", String.format(java.util.Locale.US, "%.1f", rating))
                    putString("heroImage", fav.imageUrl)
                }
                try {
                    findNavController().navigate(R.id.navigationFragment, bundle)
                } catch (e: Exception) {
                    val gmmIntentUri = Uri.parse("google.navigation:q=$lat,$lng&mode=d")
                    val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
                        setPackage("com.google.android.apps.maps")
                    }
                    startActivity(mapIntent)
                }
            },
            onShareClick = { fav ->
                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_SUBJECT, fav.placeName)
                    putExtra(Intent.EXTRA_TEXT, "Check out this saved place on Nearby: ${fav.placeName}!")
                }
                startActivity(Intent.createChooser(shareIntent, "Share Saved Place"))
            }
        )

        binding.rvCategoryFilters.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = categoryAdapter
        }

        binding.rvFavorites.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = placeAdapter
        }
    }

    private fun setupFilterDrawer() {
        filterDrawerController = FavoritesFilterDrawer(
            context = requireContext(),
            layoutInflater = layoutInflater,
            onApply = { filterState ->
                viewModel.onEvent(FavoritesEvent.ApplyFilters(filterState))
            },
            onReset = {
                viewModel.onEvent(FavoritesEvent.ResetFilters)
            }
        )
    }

    private fun setupClickListeners() {
        binding.layoutEmptyState.btnExplorePlaces.setOnClickListener {
            findNavController().navigate(R.id.exploreFragment)
        }

        binding.favoritesScrollView.setOnScrollChangeListener { _, _, scrollY, _, _ ->
            if (scrollY > 600) {
                binding.fabScrollTop.show()
            } else {
                binding.fabScrollTop.hide()
            }
        }

        binding.fabScrollTop.setOnClickListener {
            binding.favoritesScrollView.smoothScrollTo(0, 0)
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

    private fun renderUiState(state: FavoritesUiState) {
        val total = state.filteredFavorites.size
        binding.favoritesToolbar.setSubtitle("$total Places Bookmarked")
        binding.tvFavoritesCountLabel.text = "Saved Places ($total)"
        binding.tvSortIndicator.text = "Sorted by ${state.filterState.sortBy}"

        categoryAdapter?.submitCategories(state.categories, state.filterState.selectedCategory)
        placeAdapter?.submitList(state.filteredFavorites)

        if (state.filteredFavorites.isEmpty() && !state.isLoading) {
            binding.rvFavorites.visibility = View.GONE
            binding.layoutEmptyState.root.visibility = View.VISIBLE
        } else {
            binding.rvFavorites.visibility = View.VISIBLE
            binding.layoutEmptyState.root.visibility = View.GONE
        }
    }

    private fun handleEffect(effect: FavoritesEffect) {
        when (effect) {
            is FavoritesEffect.ShowToast -> {
                activity?.let { act ->
                    val type = when (effect.type) {
                        FavoritesEffect.ToastType.SUCCESS -> EmeraldToastManager.Type.SUCCESS
                        FavoritesEffect.ToastType.ERROR -> EmeraldToastManager.Type.ERROR
                        FavoritesEffect.ToastType.INFO -> EmeraldToastManager.Type.INFO
                    }
                    EmeraldToastManager.showToast(act, effect.title, effect.message, type)
                }
            }
            else -> {}
        }
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        binding.rvCategoryFilters.adapter = null
        binding.rvFavorites.adapter = null
        categoryAdapter = null
        placeAdapter = null
        filterDrawerController = null
        super.onDestroyView()
        _binding = null
    }
}
