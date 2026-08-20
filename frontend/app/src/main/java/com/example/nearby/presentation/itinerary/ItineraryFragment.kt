package com.example.nearby.presentation.itinerary

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.nearby.R
import com.example.nearby.databinding.FragmentItineraryBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.itinerary.adapter.ItineraryAdapter
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ItineraryFragment : Fragment() {

    private var _binding: FragmentItineraryBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ItineraryViewModel by viewModels()
    private var itineraryAdapter: ItineraryAdapter? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentItineraryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupToolbar()
        setupRecyclerView()
        setupSearchAndListeners()
        observeViewModel()
    }

    override fun onResume() {
        super.onResume()
        viewModel.onEvent(ItineraryEvent.Refresh)
    }

    private fun setupToolbar() {
        binding.itineraryEmeraldToolbar.setTitle("AI Itinerary")
        binding.itineraryEmeraldToolbar.setSubtitle("Your personalized travel plans")
        binding.itineraryEmeraldToolbar.setBackButtonVisible(false)
    }

    private fun setupRecyclerView() {
        itineraryAdapter = ItineraryAdapter(
            onItemClick = { item ->
                val bundle = Bundle().apply {
                    putString("itinerary_id", item.id)
                }
                findNavController().navigate(R.id.itineraryDetailFragment, bundle)
            },
            onRegenerateClick = { item ->
                viewModel.onEvent(ItineraryEvent.OnRegenerateItinerary(item.id))
            },
            onDuplicateClick = { item ->
                viewModel.onEvent(ItineraryEvent.OnDuplicateItinerary(item.id))
            },
            onDeleteClick = { item ->
                viewModel.onEvent(ItineraryEvent.OnDeleteItinerary(item.id))
            }
        )

        binding.rvItineraries.layoutManager = LinearLayoutManager(requireContext())
        binding.rvItineraries.adapter = itineraryAdapter
    }

    private fun setupSearchAndListeners() {
        binding.etItinerarySearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.onEvent(ItineraryEvent.OnSearchQueryChanged(s?.toString() ?: ""))
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnItineraryFilter.setOnClickListener {
            showFilterDrawer()
        }

        binding.fabCreateItinerary.setOnClickListener {
            findNavController().navigate(R.id.aiItineraryChatFragment)
        }
    }

    private fun showFilterDrawer() {
        val drawer = com.example.nearby.designsystem.CustomBottomDrawer(requireContext())
        val filterView = layoutInflater.inflate(R.layout.widget_filter_options, null, false)
        drawer.setTitle("Filter & Sort Itineraries")
        drawer.setCustomContentView(filterView)

        filterView.findViewById<TextView>(R.id.btn_filter_all)?.setOnClickListener {
            viewModel.onEvent(ItineraryEvent.OnCategorySelected("All"))
            drawer.dismissWithAnimation()
        }
        filterView.findViewById<TextView>(R.id.btn_filter_1day)?.setOnClickListener {
            viewModel.onEvent(ItineraryEvent.OnCategorySelected("1 Day"))
            drawer.dismissWithAnimation()
        }
        filterView.findViewById<TextView>(R.id.btn_filter_2day)?.setOnClickListener {
            viewModel.onEvent(ItineraryEvent.OnCategorySelected("2 Days"))
            drawer.dismissWithAnimation()
        }
        filterView.findViewById<TextView>(R.id.btn_filter_heritage)?.setOnClickListener {
            viewModel.onEvent(ItineraryEvent.OnCategorySelected("Heritage"))
            drawer.dismissWithAnimation()
        }
        filterView.findViewById<TextView>(R.id.btn_filter_food)?.setOnClickListener {
            viewModel.onEvent(ItineraryEvent.OnCategorySelected("Food"))
            drawer.dismissWithAnimation()
        }

        drawer.show()
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        binding.pbItineraryLoading.visibility = if (state.isLoading) View.VISIBLE else View.GONE
                        val list = state.filteredItineraries
                        itineraryAdapter?.submitList(list)

                        if (!state.isLoading && list.isEmpty()) {
                            binding.layoutItineraryEmpty.visibility = View.VISIBLE
                            binding.rvItineraries.visibility = View.GONE
                        } else {
                            binding.layoutItineraryEmpty.visibility = View.GONE
                            binding.rvItineraries.visibility = View.VISIBLE
                        }
                    }
                }

                launch {
                    viewModel.effectFlow.collect { effect ->
                        when (effect) {
                            is ItineraryEffect.ShowToast -> EmeraldToastManager.showToast(requireActivity(), "AI Itinerary", effect.message)
                            is ItineraryEffect.NavigateToDetails -> {
                                val bundle = Bundle().apply { putString("itinerary_id", effect.id) }
                                findNavController().navigate(R.id.itineraryDetailFragment, bundle)
                            }
                            ItineraryEffect.OpenCreateChat -> findNavController().navigate(R.id.aiItineraryChatFragment)
                        }
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        binding.rvItineraries.adapter = null
        itineraryAdapter = null
        super.onDestroyView()
        _binding = null
    }
}
