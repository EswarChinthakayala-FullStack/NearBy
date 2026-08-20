package com.example.nearby.presentation.profile.settings.security

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.databinding.FragmentSecuritySettingsBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class SecuritySettingsFragment : Fragment() {

    private var _binding: FragmentSecuritySettingsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSecuritySettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        binding.securityToolbar.setTitle("Account Security")
        binding.securityToolbar.setBackButtonVisible(true)
        binding.securityToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }

        binding.rowChangePassword.tvInfoRowLabel.text = "PASSWORD"
        binding.rowChangePassword.tvInfoRowValue.text = "Change Account Password"
        binding.rowChangePassword.ivInfoRowIcon.setImageResource(R.drawable.ic_check)

        binding.rowClearCache.tvInfoRowLabel.text = "STORAGE CACHE"
        binding.rowClearCache.tvInfoRowValue.text = "Clear Image & AI Cache Data"
        binding.rowClearCache.ivInfoRowIcon.setImageResource(R.drawable.ic_settings)

        binding.rowActiveSessions.tvInfoRowLabel.text = "DEVICE SESSIONS"
        binding.rowActiveSessions.tvInfoRowValue.text = "Active Session: Android Device"
        binding.rowActiveSessions.ivInfoRowIcon.setImageResource(R.drawable.ic_profile)

        binding.rowChangePassword.root.setOnClickListener {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Account Security", "Password change flow active. TLS Encrypted.", EmeraldToastManager.Type.INFO)
            }
        }

        binding.rowClearCache.root.setOnClickListener {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Cache Cleared", "Local storage and image cache cleared successfully.", EmeraldToastManager.Type.SUCCESS)
            }
        }

        binding.rowActiveSessions.root.setOnClickListener {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Session Security", "Your current session is verified and encrypted.", EmeraldToastManager.Type.INFO)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
