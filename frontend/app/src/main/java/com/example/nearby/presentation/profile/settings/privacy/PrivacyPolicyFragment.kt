package com.example.nearby.presentation.profile.settings.privacy

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.nearby.databinding.FragmentLegalDocumentBinding
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.data.remote.api.SystemApiService
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class PrivacyPolicyFragment : Fragment() {

    private var _binding: FragmentLegalDocumentBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var systemApiService: SystemApiService

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLegalDocumentBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        binding.legalToolbar.setTitle("Privacy Policy")
        binding.legalToolbar.setBackButtonVisible(true)
        binding.legalToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }

        binding.tvLegalTitle.text = "Privacy Policy — Nearby Travel Guide"
        binding.tvLegalLastUpdated.text = "Last Updated: August 1, 2026"

        loadDocument()
    }

    private fun loadDocument() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val resp = systemApiService.getPrivacyPolicy()
                if (resp.isSuccessful && resp.body()?.data != null) {
                    val data = resp.body()!!.data!!
                    val content = data["content"] ?: ""
                    binding.tvLegalBody.text = content
                } else {
                    useFallbackContent()
                }
            } catch (e: Exception) {
                useFallbackContent()
            }
        }
    }

    private fun useFallbackContent() {
        binding.tvLegalBody.text = """1. Data Collection
We collect information you provide directly to us when creating an account, editing your profile, or generating AI travel itineraries.

2. Location Services
Nearby uses your GPS position to search for nearby tourist attractions, calculate route directions, and provide reverse geocoding. Your location coordinates are never sold or shared with unauthorized third parties.

3. Data Protection & Security
We use industry-standard TLS encryption for all network requests and store authentication credentials with secure bcrypt password hashing.

4. Your Rights
You may inspect, edit, or request deletion of your account profile at any time through the Account & Security Settings section in the application."""
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
