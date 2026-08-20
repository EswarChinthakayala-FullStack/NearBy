package com.example.nearby.presentation.gallery

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.example.nearby.databinding.FragmentGalleryBinding
import com.example.nearby.presentation.gallery.adapter.GalleryGridAdapter
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class GalleryFragment : Fragment() {

    private var _binding: FragmentGalleryBinding? = null
    private val binding get() = _binding!!

    private val viewModel: GalleryViewModel by viewModels()

    private lateinit var adapter: GalleryGridAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentGalleryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        val placeId = arguments?.getString("placeId") ?: ""
        val placeName = arguments?.getString("placeName") ?: "Gallery"
        val placeSlug = arguments?.getString("placeSlug") ?: ""

        setupToolbar(placeName)
        setupRecyclerView()
        setupListeners()

        viewModel.initGallery(placeId, placeName, placeSlug)
        observeViewModel()
    }

    private fun setupToolbar(title: String) {
        binding.galleryToolbar.setTitle("$title Gallery")
        binding.galleryToolbar.setBackButtonVisible(true)
        binding.galleryToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }
        binding.galleryToolbar.setActionButtonVisible(true)
        binding.galleryToolbar.setActionIcon(R.drawable.ic_refresh)
        binding.galleryToolbar.setOnActionClickListener {
            viewModel.loadNextPage()
        }
    }

    private fun setupRecyclerView() {
        adapter = GalleryGridAdapter { position, photo ->
            val photos = viewModel.uiState.value.photos
            val placeName = viewModel.uiState.value.placeName
            val dialog = ImageViewerDialogFragment.newInstance(photos, position, placeName)
            dialog.show(childFragmentManager, "ImageViewer")
        }

        val layoutManager = GridLayoutManager(requireContext(), 2)
        binding.rvGalleryGrid.layoutManager = layoutManager
        binding.rvGalleryGrid.adapter = adapter

        binding.rvGalleryGrid.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                super.onScrolled(recyclerView, dx, dy)
                if (dy > 0) {
                    val visibleItemCount = layoutManager.childCount
                    val totalItemCount = layoutManager.itemCount
                    val pastVisiblesItems = layoutManager.findFirstVisibleItemPosition()

                    if ((visibleItemCount + pastVisiblesItems) >= totalItemCount - 4) {
                        viewModel.loadNextPage()
                    }
                }
            }
        })
    }

    private fun setupListeners() {
        binding.btnRetryGallery.setOnClickListener {
            viewModel.refreshGallery()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    renderUiState(state)
                }
            }
        }
    }

    private fun renderUiState(state: GalleryUiState) {
        binding.pbGalleryLoading.visibility = if (state.isLoading) View.VISIBLE else View.GONE

        if (state.photos.isNotEmpty()) {
            binding.rvGalleryGrid.visibility = View.VISIBLE
            binding.layoutGalleryEmpty.visibility = View.GONE
            binding.galleryToolbar.setSubtitle("${state.photos.size} HD Photos Loaded")
            adapter.submitList(state.photos)
        } else if (!state.isLoading) {
            binding.rvGalleryGrid.visibility = View.GONE
            binding.layoutGalleryEmpty.visibility = View.VISIBLE
            binding.galleryToolbar.setSubtitle(null)
        }
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        _binding?.rvGalleryGrid?.adapter = null
        super.onDestroyView()
        _binding = null
    }
}
