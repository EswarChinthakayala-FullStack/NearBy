package com.example.nearby.presentation.ainearby

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.nearby.R
import com.example.nearby.databinding.FragmentAiNearbyBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.ainearby.adapter.AiRecommendationAdapter
import com.example.nearby.presentation.ainearby.adapter.AiSuggestionAdapter
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AiNearbyFragment : Fragment() {

    private var _binding: FragmentAiNearbyBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AiNearbyViewModel by viewModels()

    private var suggestionAdapter: AiSuggestionAdapter? = null
    private var recommendationAdapter: AiRecommendationAdapter? = null

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            fetchDeviceLocation()
        } else {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Location Required", "Using default region for nearby recommendations.", EmeraldToastManager.Type.INFO)
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAiNearbyBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        setupToolbar()
        setupSearchCard()
        setupRecyclerViews()
        checkLocationPermission()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.aiToolbar.setTitle("AI Nearby")
        binding.aiToolbar.setSubtitle("Discover places around you intelligently")
        binding.aiToolbar.setBackButtonVisible(false)
        binding.aiToolbar.setOnActionClickListener {
            viewModel.onEvent(AiNearbyEvent.Refresh)
        }
    }

    private fun setupSearchCard() {
        binding.aiSearchCard.setOnSendClickListener { query ->
            viewModel.onEvent(AiNearbyEvent.SubmitQuery(query))
        }
        binding.aiSearchCard.setOnVoiceClickListener {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Voice Search", "Voice input coming soon!", EmeraldToastManager.Type.INFO)
            }
        }
    }

    private fun setupRecyclerViews() {
        suggestionAdapter = AiSuggestionAdapter { prompt ->
            binding.aiSearchCard.setQuery(prompt)
            viewModel.onEvent(AiNearbyEvent.SubmitQuery(prompt))
        }

        recommendationAdapter = AiRecommendationAdapter(
            onItemClick = { rec ->
                val bundle = Bundle().apply {
                    putString("placeSlug", rec.placeSlug)
                    putString("placeId", rec.placeUuid)
                    putString("placeName", rec.placeName)
                    putString("placeCategory", rec.category)
                }
                findNavController().navigate(R.id.placeDetailFragment, bundle)
            },
            onFavoriteToggle = { rec ->
                viewModel.onEvent(AiNearbyEvent.ToggleFavorite(rec.placeUuid))
            },
            onNavigateClick = { rec ->
                val bundle = Bundle().apply {
                    putString("placeId", rec.placeUuid)
                    putDouble("latitude", rec.latitude)
                    putDouble("longitude", rec.longitude)
                    putString("placeName", rec.placeName)
                    putString("placeCategory", rec.category)
                    putString("rating", String.format(java.util.Locale.US, "%.1f", rec.rating))
                    putString("heroImage", rec.coverImage)
                }
                try {
                    findNavController().navigate(R.id.navigationFragment, bundle)
                } catch (e: Exception) {
                    val gmmIntentUri = Uri.parse("google.navigation:q=${rec.latitude},${rec.longitude}&mode=d")
                    val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
                        setPackage("com.google.android.apps.maps")
                    }
                    startActivity(mapIntent)
                }
            },
            onShareClick = { rec ->
                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_SUBJECT, rec.placeName)
                    putExtra(Intent.EXTRA_TEXT, "Check out this AI recommendation: ${rec.placeName} on Nearby!")
                }
                startActivity(Intent.createChooser(shareIntent, "Share Place"))
            }
        )

        binding.rvSuggestedPrompts.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = suggestionAdapter
        }

        binding.rvAiRecommendations.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = recommendationAdapter
        }
    }

    private fun checkLocationPermission() {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION)
            == PackageManager.PERMISSION_GRANTED
        ) {
            fetchDeviceLocation()
        } else {
            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    private fun fetchDeviceLocation() {
        try {
            val locationManager = requireContext().getSystemService(android.content.Context.LOCATION_SERVICE) as? android.location.LocationManager
            val lastLocation = locationManager?.getLastKnownLocation(android.location.LocationManager.GPS_PROVIDER)
                ?: locationManager?.getLastKnownLocation(android.location.LocationManager.NETWORK_PROVIDER)

            if (lastLocation != null) {
                viewModel.onEvent(AiNearbyEvent.UpdateLocation(lastLocation.latitude, lastLocation.longitude))
            }
        } catch (e: Exception) {
            // Ignore location errors and use default
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

    private fun renderUiState(state: AiNearbyUiState) {
        suggestionAdapter?.submitList(state.suggestedPrompts)

        // Render Active Agents Status
        if (state.isLoading || state.activeAgents.isNotEmpty() || state.currentThinkingAgent.isNotEmpty()) {
            binding.layoutAgentStatus.visibility = View.VISIBLE
            val agentCount = if (state.activeAgents.isNotEmpty()) state.activeAgents.size else 5
            binding.tvAgentStatusLabel.text = if (state.isLoading) "Agentic AI Crew Reasoning..." else "Powered by $agentCount AI Agents"

            if (state.currentThinkingAgent.isNotEmpty()) {
                binding.tvCurrentThinkingStep.visibility = View.VISIBLE
                binding.tvCurrentThinkingStep.text = "🧠 ${state.currentThinkingAgent} — ${state.currentThinkingMessage}"
            } else {
                binding.tvCurrentThinkingStep.visibility = View.GONE
            }

            renderAgentPills(state.activeAgents.ifEmpty {
                listOf("Query Intent Specialist", "Geospatial & Weather Specialist", "Tourism Recommendation Architect", "ValidationAgent", "FormatterAgent")
            })
        } else {
            binding.layoutAgentStatus.visibility = View.GONE
        }

        if (state.isLoading) {
            binding.layoutAiLoading.root.visibility = View.VISIBLE
            binding.cardAiExplanation.visibility = View.GONE
            binding.tvRecommendationsHeader.visibility = View.GONE
            binding.rvAiRecommendations.visibility = View.GONE
        } else {
            binding.layoutAiLoading.root.visibility = View.GONE

            if (state.summaryText.isNotEmpty()) {
                binding.cardAiExplanation.visibility = View.VISIBLE
                binding.tvAiSummary.text = state.summaryText
            } else {
                binding.cardAiExplanation.visibility = View.GONE
            }

            if (state.recommendations.isNotEmpty()) {
                binding.tvRecommendationsHeader.visibility = View.VISIBLE
                binding.rvAiRecommendations.visibility = View.VISIBLE
                recommendationAdapter?.submitList(state.recommendations)
            } else {
                binding.tvRecommendationsHeader.visibility = View.GONE
                binding.rvAiRecommendations.visibility = View.GONE
            }
        }
    }

    private fun renderAgentPills(agents: List<String>) {
        binding.llAgentPills.removeAllViews()
        val inflater = LayoutInflater.from(requireContext())
        for (agent in agents) {
            val pillView = inflater.inflate(R.layout.item_agent_pill, binding.llAgentPills, false)
            val tvName = pillView.findViewById<android.widget.TextView>(R.id.tvAgentName)
            tvName.text = agent
            binding.llAgentPills.addView(pillView)
        }
    }

    private fun handleEffect(effect: AiNearbyEffect) {
        when (effect) {
            is AiNearbyEffect.ShowToast -> {
                activity?.let { act ->
                    val type = if (effect.isError) EmeraldToastManager.Type.ERROR else EmeraldToastManager.Type.SUCCESS
                    EmeraldToastManager.showToast(act, effect.title, effect.message, type)
                }
            }
            else -> {}
        }
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        binding.rvSuggestedPrompts.adapter = null
        binding.rvAiRecommendations.adapter = null
        suggestionAdapter = null
        recommendationAdapter = null
        super.onDestroyView()
        _binding = null
    }
}
