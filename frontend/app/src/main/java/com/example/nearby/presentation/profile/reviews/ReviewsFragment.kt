package com.example.nearby.presentation.profile.reviews

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
import com.example.nearby.databinding.FragmentReviewsBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.favorites.adapter.FavoriteCategoryAdapter
import com.example.nearby.presentation.profile.reviews.adapter.ReviewAdapter
import com.example.nearby.presentation.profile.reviews.dialog.DeleteReviewConfirmationDialog
import com.example.nearby.presentation.profile.reviews.dialog.EditReviewDialog
import com.example.nearby.presentation.profile.reviews.dialog.ReviewsFilterDrawer
import com.example.nearby.presentation.profile.reviews.model.UserReviewDomainModel
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ReviewsFragment : Fragment() {

    private var _binding: FragmentReviewsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ReviewsViewModel by viewModels()

    private var reviewAdapter: ReviewAdapter? = null
    private var categoryAdapter: FavoriteCategoryAdapter? = null
    private var filterDrawerController: ReviewsFilterDrawer? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentReviewsBinding.inflate(inflater, container, false)
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
        binding.reviewsToolbar.setTitle("My Reviews")
        binding.reviewsToolbar.setSubtitle("Ratings & Feedback")
        binding.reviewsToolbar.setBackButtonVisible(true)
        binding.reviewsToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }
        binding.reviewsToolbar.setOnActionClickListener {
            viewModel.onEvent(ReviewsEvent.Refresh)
        }
    }

    private fun setupSearch() {
        binding.searchViewReviews.setHint("Search by place, city, category, or title...")
        binding.searchViewReviews.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val query = s?.toString() ?: ""
                viewModel.onEvent(ReviewsEvent.SearchQueryChanged(query))
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.searchViewReviews.setOnFilterClickListener {
            filterDrawerController?.open(viewModel.uiState.value.filterState)
        }
    }

    private fun setupRecyclerViews() {
        categoryAdapter = FavoriteCategoryAdapter { category ->
            viewModel.onEvent(ReviewsEvent.CategorySelected(category))
        }

        reviewAdapter = ReviewAdapter(
            onViewPlaceClick = { review ->
                navigateToPlaceDetail(review.placeSlug, review.placeName)
            },
            onEditClick = { review ->
                showEditDialog(review)
            },
            onDeleteClick = { review ->
                showDeleteDialog(review)
            },
            onToggleExpand = { review ->
                viewModel.onEvent(ReviewsEvent.ToggleExpandReview(review.reviewUuid))
            },
            onPhotoClick = { photos, index ->
                activity?.let { act ->
                    EmeraldToastManager.showToast(act, "Photo Gallery", "Viewing photo ${index + 1} of ${photos.size}", EmeraldToastManager.Type.INFO)
                }
            }
        )

        binding.rvReviewCategoryFilters.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = categoryAdapter
        }

        binding.rvReviews.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = reviewAdapter
        }
    }

    private fun setupFilterDrawer() {
        filterDrawerController = ReviewsFilterDrawer(
            context = requireContext(),
            layoutInflater = layoutInflater,
            onApply = { filterState ->
                viewModel.onEvent(ReviewsEvent.ApplyFilters(filterState))
            },
            onReset = {
                viewModel.onEvent(ReviewsEvent.ResetFilters)
            }
        )
    }

    private fun setupClickListeners() {
        binding.swipeRefreshLayout.setOnRefreshListener {
            viewModel.onEvent(ReviewsEvent.Refresh)
        }

        binding.btnExplorePlaces.setOnClickListener {
            findNavController().navigate(R.id.exploreFragment)
        }

        binding.reviewsScrollView.setOnScrollChangeListener { _, _, scrollY, _, _ ->
            if (scrollY > 150) {
                binding.reviewsToolbar.setTitle("My Submitted Reviews")
            } else {
                binding.reviewsToolbar.setTitle("My Reviews")
            }

            if (scrollY > 600) {
                binding.fabScrollTop.show()
            } else {
                binding.fabScrollTop.hide()
            }
        }

        binding.fabScrollTop.setOnClickListener {
            binding.reviewsScrollView.smoothScrollTo(0, 0)
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

    private fun renderUiState(state: ReviewsUiState) {
        binding.swipeRefreshLayout.isRefreshing = state.isRefreshing

        // Statistics Header
        binding.tvStatTotalReviews.text = state.statistics.totalReviews.toString()
        binding.tvStatAvgRating.text = String.format(java.util.Locale.US, "%.1f", state.statistics.averageRating)
        binding.tvStatHelpfulVotes.text = state.statistics.totalHelpfulVotes.toString()
        binding.tvStatTotalPhotos.text = state.statistics.totalPhotosUploaded.toString()

        val count = state.filteredReviews.size
        binding.tvReviewsCountLabel.text = "Posted Feedback ($count)"
        binding.tvReviewSortIndicator.text = "Sorted by ${state.filterState.sortBy}"

        categoryAdapter?.submitCategories(state.categories, state.filterState.selectedCategory)
        reviewAdapter?.submitList(state.filteredReviews)

        // Shimmer vs List vs Empty State
        if (state.isLoading && state.reviews.isEmpty()) {
            binding.layoutShimmerContainer.root.visibility = View.VISIBLE
            binding.rvReviews.visibility = View.GONE
            binding.layoutEmptyReviews.visibility = View.GONE
        } else if (state.filteredReviews.isEmpty() && !state.isLoading) {
            binding.layoutShimmerContainer.root.visibility = View.GONE
            binding.rvReviews.visibility = View.GONE
            binding.layoutEmptyReviews.visibility = View.VISIBLE
        } else {
            binding.layoutShimmerContainer.root.visibility = View.GONE
            binding.rvReviews.visibility = View.VISIBLE
            binding.layoutEmptyReviews.visibility = View.GONE
        }
    }

    private fun showDeleteDialog(review: UserReviewDomainModel) {
        val dialog = DeleteReviewConfirmationDialog(requireContext(), review.placeName) {
            viewModel.onEvent(ReviewsEvent.ExecuteDeleteReview(review))
        }
        dialog.show()
    }

    private fun showEditDialog(review: UserReviewDomainModel) {
        val dialog = EditReviewDialog(requireContext(), review) { rating, title, comment ->
            viewModel.onEvent(ReviewsEvent.SaveEditedReview(review.reviewUuid, rating, title, comment))
        }
        dialog.show()
    }

    private fun navigateToPlaceDetail(slug: String, name: String) {
        if (slug.isBlank()) return
        val bundle = Bundle().apply {
            putString("placeId", slug)
            putString("placeSlug", slug)
            putString("placeName", name)
        }
        try {
            findNavController().navigate(R.id.action_reviews_to_detail, bundle)
        } catch (e: Exception) {
            try {
                findNavController().navigate(R.id.placeDetailFragment, bundle)
            } catch (e2: Exception) {
                activity?.let { act ->
                    EmeraldToastManager.showToast(act, "Navigation Error", "Could not open details for $name", EmeraldToastManager.Type.ERROR)
                }
            }
        }
    }

    private fun handleEffect(effect: ReviewsEffect) {
        when (effect) {
            is ReviewsEffect.ShowToast -> {
                activity?.let { act ->
                    val type = when (effect.type) {
                        ReviewsEffect.ToastType.SUCCESS -> EmeraldToastManager.Type.SUCCESS
                        ReviewsEffect.ToastType.ERROR -> EmeraldToastManager.Type.ERROR
                        ReviewsEffect.ToastType.INFO -> EmeraldToastManager.Type.INFO
                    }
                    EmeraldToastManager.showToast(act, effect.title, effect.message, type)
                }
            }
            is ReviewsEffect.NavigateToPlaceDetail -> {
                navigateToPlaceDetail(effect.placeSlug, "Tourist Attraction")
            }
        }
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        binding.rvReviewCategoryFilters.adapter = null
        binding.rvReviews.adapter = null
        categoryAdapter = null
        reviewAdapter = null
        filterDrawerController = null
        super.onDestroyView()
        _binding = null
    }
}
