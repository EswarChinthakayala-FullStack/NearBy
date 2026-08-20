package com.example.nearby.presentation.profile.settings.notifications

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.databinding.FragmentNotificationSettingsBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class NotificationSettingsFragment : Fragment() {

    private var _binding: FragmentNotificationSettingsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        binding.notificationsToolbar.setTitle("Notifications")
        binding.notificationsToolbar.setBackButtonVisible(true)
        binding.notificationsToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }

        setupSwitches()
    }

    private fun setupSwitches() {
        binding.switchTripReminders.setTitle("Trip & Itinerary Reminders")
        binding.switchTripReminders.setSubtitle("Alerts for upcoming activities and departures")
        binding.switchTripReminders.setIcon(R.drawable.ic_trips)
        binding.switchTripReminders.setChecked(true)

        binding.switchNearbyRecs.setTitle("Nearby Recommendations")
        binding.switchNearbyRecs.setSubtitle("Real-time push alerts when passing top rated places")
        binding.switchNearbyRecs.setIcon(R.drawable.ic_compass)
        binding.switchNearbyRecs.setChecked(true)

        binding.switchReviewReplies.setTitle("Review Replies & Community")
        binding.switchReviewReplies.setSubtitle("Alerts when travelers reply or like your reviews")
        binding.switchReviewReplies.setIcon(R.drawable.ic_star)
        binding.switchReviewReplies.setChecked(true)

        binding.switchTravelTips.setTitle("Travel Tips & Seasonal Deals")
        binding.switchTravelTips.setSubtitle("Curated travel guides and partner offers")
        binding.switchTravelTips.setIcon(R.drawable.ic_bookmark)
        binding.switchTravelTips.setChecked(false)

        val listener: (Boolean) -> Unit = { enabled ->
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Notification Preference Saved", if (enabled) "Notifications enabled." else "Notifications disabled.", EmeraldToastManager.Type.INFO)
            }
        }

        binding.switchTripReminders.setOnCheckedChangeListener(listener)
        binding.switchNearbyRecs.setOnCheckedChangeListener(listener)
        binding.switchReviewReplies.setOnCheckedChangeListener(listener)
        binding.switchTravelTips.setOnCheckedChangeListener(listener)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
