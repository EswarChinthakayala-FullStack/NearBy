package com.example.nearby.presentation.profile.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.nearby.R
import com.example.nearby.databinding.FragmentNotificationsBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class NotificationFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: NotificationsViewModel by viewModels()
    private var adapter: NotificationAdapter? = null

    private val filterCategories = listOf("All", "Unread", "Security", "Reviews", "Favorites", "Spatial AI")

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        setupToolbar()
        setupRecyclerView()
        setupListeners()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.notificationsToolbar.setTitle("Notifications & Live Alerts")
        binding.notificationsToolbar.setBackButtonVisible(true)
        binding.notificationsToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }
    }

    private fun setupRecyclerView() {
        adapter = NotificationAdapter(
            items = emptyList(),
            onItemClick = { item ->
                activity?.let { act ->
                    EmeraldToastManager.showToast(act, item.title, item.message, EmeraldToastManager.Type.INFO)
                }
            },
            onDismissClick = { item ->
                activity?.let { act ->
                    EmeraldToastManager.showToast(act, "Notification Dismissed", item.title, EmeraldToastManager.Type.INFO)
                }
            }
        )

        binding.rvNotifications.apply {
            layoutManager = LinearLayoutManager(requireContext())
            this.adapter = this@NotificationFragment.adapter
        }
    }

    private fun setupListeners() {
        binding.btnClearAll.setOnClickListener {
            viewModel.clearAll()
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Notifications Cleared", "All notifications removed.", EmeraldToastManager.Type.INFO)
            }
        }
    }

    private fun renderFilterChips(selectedFilter: String, totalCount: Int) {
        binding.filterChipsContainer.removeAllViews()
        filterCategories.forEach { filter ->
            val label = if (filter == "All") "All Notifications ($totalCount)" else filter
            val chip = TextView(requireContext()).apply {
                text = label
                setTextAppearance(R.style.Typography_Caption)
                setPadding(32, 16, 32, 16)
                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { setMargins(0, 0, 16, 0) }
                layoutParams = params

                if (filter == selectedFilter) {
                    setBackgroundResource(R.drawable.bg_button_primary)
                    setTextColor(ContextCompat.getColor(context, R.color.white))
                } else {
                    setBackgroundResource(R.drawable.bg_chip)
                    setTextColor(ContextCompat.getColor(context, R.color.text_primary))
                }

                setOnClickListener {
                    viewModel.selectFilter(filter)
                }
            }
            binding.filterChipsContainer.addView(chip)
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    renderFilterChips(state.selectedFilter, state.notifications.size)
                    adapter?.updateItems(state.filteredNotifications)

                    if (state.filteredNotifications.isEmpty()) {
                        binding.containerEmptyNotifications.visibility = View.VISIBLE
                        binding.rvNotifications.visibility = View.GONE
                    } else {
                        binding.containerEmptyNotifications.visibility = View.GONE
                        binding.rvNotifications.visibility = View.VISIBLE
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        _binding?.let { b ->
            b.rvNotifications.adapter = null
            b.btnClearAll.setOnClickListener(null)
        }
        adapter = null
        super.onDestroyView()
        _binding = null
    }
}
