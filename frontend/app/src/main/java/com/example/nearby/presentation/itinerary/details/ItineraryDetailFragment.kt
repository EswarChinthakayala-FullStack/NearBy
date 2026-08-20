package com.example.nearby.presentation.itinerary.details

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
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
import androidx.recyclerview.widget.LinearLayoutManager
import coil3.load
import com.example.nearby.R
import com.example.nearby.databinding.FragmentItineraryDetailBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.itinerary.adapter.DayTimelineAdapter
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ItineraryDetailFragment : Fragment() {

    private var _binding: FragmentItineraryDetailBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ItineraryDetailViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentItineraryDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupToolbar()

        val itineraryId = arguments?.getString("itinerary_uuid")
            ?: arguments?.getString("itinerary_id")
            ?: arguments?.getString("itineraryId")
            ?: ""
        if (itineraryId.isNotEmpty()) {
            viewModel.loadItinerary(itineraryId)
        }

        observeViewModel()
    }

    private fun setupToolbar() {
        binding.detailEmeraldToolbar.setTitle("Itinerary Details")
        binding.detailEmeraldToolbar.setSubtitle("Day-by-day travel schedule")
        binding.detailEmeraldToolbar.setBackButtonVisible(true)
        binding.detailEmeraldToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }
    }

    private fun renderDetails(itinerary: ItineraryResponseDto) {
        val daysLabel = itinerary.travelDates ?: if (itinerary.days.size == 1) "1 Day" else "${itinerary.days.size} Days"
        binding.tvDetailTitle.text = itinerary.title
        binding.tvDetailDestination.text = "📍 ${itinerary.destination} • $daysLabel"
        binding.tvDetailSummary.text = itinerary.summary

        val promptText = itinerary.originalPrompt ?: "Explore top attractions in ${itinerary.destination}"
        binding.tvDetailPromptText.text = "\"$promptText\""

        binding.btnCopyPrompt.setOnClickListener {
            val clipboard = requireContext().getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
            val clip = ClipData.newPlainText("AI Prompt", promptText)
            clipboard?.setPrimaryClip(clip)
            EmeraldToastManager.showToast(requireActivity(), "Copied", "AI Request prompt copied to clipboard.")
        }

        val weather = itinerary.weatherSummary
        if (weather != null) {
            binding.tvDetailWeatherTemp.text = "${weather.temperatureC}°C • ${weather.condition} (Rain: ${weather.rainProbabilityPct}%)"
            binding.tvDetailWeatherRec.text = weather.recommendation
        } else {
            binding.tvDetailWeatherTemp.text = "26.0°C • Pleasant Weather"
            binding.tvDetailWeatherRec.text = "Great weather for outdoor activities."
        }

        val imageUrl = com.example.nearby.utils.DestinationImageHelper.getImageUrlForDestination(itinerary.destination)
        binding.ivDetailHero.load(imageUrl)

        binding.rvDetailTimeline.layoutManager = LinearLayoutManager(requireContext())
        binding.rvDetailTimeline.adapter = DayTimelineAdapter(
            days = itinerary.days,
            onViewPlaceClick = { slug ->
                if (slug.isNotBlank()) {
                    val bundle = Bundle().apply {
                        putString("place_id", slug)
                    }
                    findNavController().navigate(R.id.placeDetailFragment, bundle)
                } else {
                    EmeraldToastManager.showToast(requireActivity(), "Itinerary", "Place detail slug unavailable.")
                }
            },
            onNavigateClick = { activityItem ->
                if (activityItem.placeSlug.isNotBlank()) {
                    val bundle = Bundle().apply {
                        putString("dest_slug", activityItem.placeSlug)
                        putString("dest_name", activityItem.placeName)
                    }
                    findNavController().navigate(R.id.navigationFragment, bundle)
                } else {
                    EmeraldToastManager.showToast(requireActivity(), "Itinerary", "Navigation destination unavailable.")
                }
            }
        )
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    if (state.itinerary != null) {
                        renderDetails(state.itinerary)
                    } else if (state.errorMessage != null) {
                        EmeraldToastManager.showToast(requireActivity(), "Error", state.errorMessage)
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        binding.rvDetailTimeline.adapter = null
        super.onDestroyView()
        _binding = null
    }
}
