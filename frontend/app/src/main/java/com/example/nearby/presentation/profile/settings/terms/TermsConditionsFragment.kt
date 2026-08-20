package com.example.nearby.presentation.profile.settings.terms

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
class TermsConditionsFragment : Fragment() {

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

        binding.legalToolbar.setTitle("Terms & Conditions")
        binding.legalToolbar.setBackButtonVisible(true)
        binding.legalToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }

        binding.tvLegalTitle.text = "Terms & Conditions — Nearby Travel Guide"
        binding.tvLegalLastUpdated.text = "Last Updated: August 1, 2026"

        loadDocument()
    }

    private fun loadDocument() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val resp = systemApiService.getTermsConditions()
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
        binding.tvLegalBody.text = """1. Acceptance of Terms
By accessing or using the Nearby application, you agree to be bound by these Terms & Conditions.

2. Use of Services
Nearby provides AI-driven travel recommendations, itinerary generation, and place exploration. You agree to use the services for lawful personal travel planning purposes only.

3. Intellectual Property
All content, branding, UI designs, and AI itinerary models are the intellectual property of Nearby Travel Inc.

4. Service Availability
While we strive for 99.9% service uptime, Nearby provides travel recommendations on an "as is" and "as available" basis."""
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
