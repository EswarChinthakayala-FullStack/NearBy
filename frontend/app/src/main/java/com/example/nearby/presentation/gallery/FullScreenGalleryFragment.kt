package com.example.nearby.presentation.gallery

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.viewpager2.widget.ViewPager2
import com.example.nearby.databinding.FragmentFullScreenGalleryBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.detail.adapter.GalleryAdapter
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class FullScreenGalleryFragment : Fragment() {

    private var _binding: FragmentFullScreenGalleryBinding? = null
    private val binding get() = _binding!!

    private var isToolbarVisible = true

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentFullScreenGalleryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val images = arguments?.getStringArrayList("imageUrls") ?: arrayListOf()
        val initialPosition = arguments?.getInt("initialPosition", 0) ?: 0

        binding.galleryViewPager.adapter = GalleryPagerAdapter(images)
        binding.galleryViewPager.setCurrentItem(initialPosition, false)

        val thumbnailAdapter = GalleryAdapter { selectedPos ->
            binding.galleryViewPager.setCurrentItem(selectedPos, true)
        }
        binding.rvBottomThumbnails.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = thumbnailAdapter
        }
        thumbnailAdapter.submitList(images)

        updateCounter(initialPosition, images.size)

        binding.galleryViewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                updateCounter(position, images.size)
            }
        })

        binding.btnCloseGallery.setOnClickListener {
            findNavController().navigateUp()
        }

        binding.btnShareImage.setOnClickListener {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Share Image", "Preparing image link...", EmeraldToastManager.Type.INFO)
            }
        }
    }

    private fun updateCounter(current: Int, total: Int) {
        val totalCount = if (total == 0) 1 else total
        binding.tvGalleryCounter.text = "${current + 1} / $totalCount"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
