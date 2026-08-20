package com.example.nearby.presentation.itinerary.chat

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
import com.example.nearby.R
import com.example.nearby.databinding.FragmentAiChatBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.itinerary.adapter.AiChatSuggestionAdapter
import com.example.nearby.presentation.itinerary.adapter.ChatAdapter
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AiItineraryChatFragment : Fragment() {

    private var _binding: FragmentAiChatBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AiChatViewModel by viewModels()
    private var chatAdapter: ChatAdapter? = null
    private var suggestionAdapter: AiChatSuggestionAdapter? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAiChatBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }
        WindowInsetsHelper.applyImeBottomPadding(binding.root)

        setupToolbar()
        setupRecyclerViews()
        setupListeners()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.chatEmeraldToolbar.setTitle("AI Travel Assistant")
        binding.chatEmeraldToolbar.setSubtitle("Conversational Itinerary Architect")
        binding.chatEmeraldToolbar.setBackButtonVisible(true)
        binding.chatEmeraldToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }
    }

    private fun setupRecyclerViews() {
        chatAdapter = ChatAdapter(
            onViewItineraryClick = { itinerary ->
                val bundle = Bundle().apply {
                    putString("itinerary_id", itinerary.id)
                }
                findNavController().navigate(R.id.itineraryDetailFragment, bundle)
            }
        )

        binding.rvChatMessages.apply {
            layoutManager = LinearLayoutManager(requireContext()).apply {
                stackFromEnd = true
            }
            adapter = chatAdapter
        }
    }

    private fun setupListeners() {
        binding.btnChatSend.setOnClickListener {
            val text = binding.etChatInput.text.toString()
            if (text.isNotBlank()) {
                viewModel.sendMessage(text)
                binding.etChatInput.text.clear()
            }
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        chatAdapter?.submitList(state.messages) {
                            if (state.messages.isNotEmpty()) {
                                binding.rvChatMessages.smoothScrollToPosition(state.messages.size - 1)
                            }
                        }

                        if (suggestionAdapter == null && state.suggestedPrompts.isNotEmpty()) {
                            suggestionAdapter = AiChatSuggestionAdapter(state.suggestedPrompts) { prompt ->
                                viewModel.sendMessage(prompt)
                            }
                            binding.rvSuggestionChips.apply {
                                layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
                                adapter = suggestionAdapter
                            }
                        }
                    }
                }

                launch {
                    viewModel.effectFlow.collect { effect ->
                        when (effect) {
                            is AiChatEffect.ShowToast -> EmeraldToastManager.showToast(requireActivity(), "AI Assistant", effect.message)
                            is AiChatEffect.NavigateToDetail -> {
                                val bundle = Bundle().apply {
                                    putString("itinerary_id", effect.itinerary.id)
                                }
                                findNavController().navigate(R.id.itineraryDetailFragment, bundle)
                            }
                        }
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        binding.rvChatMessages.adapter = null
        binding.rvSuggestionChips.adapter = null
        chatAdapter = null
        suggestionAdapter = null
        super.onDestroyView()
        _binding = null
    }
}
