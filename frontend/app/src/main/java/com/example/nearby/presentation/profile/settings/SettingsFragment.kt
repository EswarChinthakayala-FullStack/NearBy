package com.example.nearby.presentation.profile.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.data.local.SessionManager
import com.example.nearby.databinding.FragmentSettingsBinding
import com.example.nearby.presentation.profile.editprofile.dialog.DiscardChangesDrawer
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class SettingsFragment : Fragment() {

    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        setupToolbar()
        setupRows()
        setupLogout()
    }

    private fun setupToolbar() {
        binding.settingsToolbar.setTitle("Settings")
        binding.settingsToolbar.setBackButtonVisible(true)
        binding.settingsToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }
        binding.tvSettingsVersionFooter.text = "Nearby v2.0.0 (Build 206) • API v1"
    }

    private fun setupRows() {
        // Section 1: Account
        binding.rowEditProfile.tvInfoRowLabel.text = "PROFILE"
        binding.rowEditProfile.tvInfoRowValue.text = "Manage Profile & Personal Details"
        binding.rowEditProfile.ivInfoRowIcon.setImageResource(R.drawable.ic_profile)

        binding.rowChangePassword.tvInfoRowLabel.text = "SECURITY"
        binding.rowChangePassword.tvInfoRowValue.text = "Account Password & Security"
        binding.rowChangePassword.ivInfoRowIcon.setImageResource(R.drawable.ic_lock)

        binding.rowMyTrips.tvInfoRowLabel.text = "TRAVEL HISTORY"
        binding.rowMyTrips.tvInfoRowValue.text = "My Saved AI Itineraries"
        binding.rowMyTrips.ivInfoRowIcon.setImageResource(R.drawable.ic_trips)

        binding.rowMyReviews.tvInfoRowLabel.text = "REVIEWS"
        binding.rowMyReviews.tvInfoRowValue.text = "My Posted Ratings & Reviews"
        binding.rowMyReviews.ivInfoRowIcon.setImageResource(R.drawable.ic_star)

        // Section 2: Preferences
        binding.rowAppearance.tvInfoRowLabel.text = "THEME"
        binding.rowAppearance.tvInfoRowValue.text = "Appearance & Visual Style"
        binding.rowAppearance.ivInfoRowIcon.setImageResource(R.drawable.ic_theme)

        binding.rowNotifications.tvInfoRowLabel.text = "ALERTS"
        binding.rowNotifications.tvInfoRowValue.text = "Notification Preferences"
        binding.rowNotifications.ivInfoRowIcon.setImageResource(R.drawable.ic_notification)

        // Section 3: Privacy & Security
        binding.rowSecurity.tvInfoRowLabel.text = "ACCOUNT SECURITY"
        binding.rowSecurity.tvInfoRowValue.text = "Sessions & Storage Cache"
        binding.rowSecurity.ivInfoRowIcon.setImageResource(R.drawable.ic_verified)

        binding.rowPrivacyPolicy.tvInfoRowLabel.text = "PRIVACY"
        binding.rowPrivacyPolicy.tvInfoRowValue.text = "Privacy Policy Document"
        binding.rowPrivacyPolicy.ivInfoRowIcon.setImageResource(R.drawable.ic_bookmark)

        binding.rowTermsConditions.tvInfoRowLabel.text = "TERMS"
        binding.rowTermsConditions.tvInfoRowValue.text = "Terms & Conditions"
        binding.rowTermsConditions.ivInfoRowIcon.setImageResource(R.drawable.ic_compass)

        // Section 4: Support & About
        binding.rowLicenses.tvInfoRowLabel.text = "OPEN SOURCE"
        binding.rowLicenses.tvInfoRowValue.text = "Open Source Licenses"
        binding.rowLicenses.ivInfoRowIcon.setImageResource(R.drawable.ic_explore)

        binding.rowHelpSupport.tvInfoRowLabel.text = "HELP CENTER"
        binding.rowHelpSupport.tvInfoRowValue.text = "Help & Support Center"
        binding.rowHelpSupport.ivInfoRowIcon.setImageResource(R.drawable.ic_search)

        binding.rowAbout.tvInfoRowLabel.text = "ABOUT"
        binding.rowAbout.tvInfoRowValue.text = "About Nearby & System Info"
        binding.rowAbout.ivInfoRowIcon.setImageResource(R.drawable.ic_settings)

        // Click Listeners
        binding.rowEditProfile.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_editProfile)
        }

        binding.rowChangePassword.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_security)
        }

        binding.rowMyTrips.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_myTrips)
        }

        binding.rowMyReviews.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_reviews)
        }

        binding.rowAppearance.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_appearance)
        }

        binding.rowNotifications.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_notifications)
        }

        binding.rowSecurity.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_security)
        }

        binding.rowPrivacyPolicy.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_privacy)
        }

        binding.rowTermsConditions.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_terms)
        }

        binding.rowLicenses.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_licenses)
        }

        binding.rowHelpSupport.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_support)
        }

        binding.rowAbout.root.setOnClickListener {
            findNavController().navigate(R.id.action_settings_to_about)
        }
    }

    private fun setupLogout() {
        binding.btnSettingsLogout.setOnClickListener {
            val drawer = com.example.nearby.presentation.profile.dialog.LogoutConfirmationDrawer(
                context = requireContext(),
                layoutInflater = layoutInflater,
                onLogoutConfirmed = {
                    viewLifecycleOwner.lifecycleScope.launch {
                        sessionManager.clearSession()
                        findNavController().navigate(R.id.loginFragment)
                    }
                }
            )
            drawer.show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
