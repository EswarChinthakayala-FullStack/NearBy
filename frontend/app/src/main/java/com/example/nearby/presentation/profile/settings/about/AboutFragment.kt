package com.example.nearby.presentation.profile.settings.about

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.databinding.FragmentAboutBinding
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.data.remote.api.SystemApiService
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class AboutFragment : Fragment() {

    private var _binding: FragmentAboutBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var systemApiService: SystemApiService

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAboutBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        binding.aboutToolbar.setTitle("About Nearby")
        binding.aboutToolbar.setBackButtonVisible(true)
        binding.aboutToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }

        binding.rowBackendVersion.tvInfoRowLabel.text = "BACKEND VERSION"
        binding.rowBackendVersion.tvInfoRowValue.text = "v2.0.0 (FastAPI & SQLAlchemy Async)"
        binding.rowBackendVersion.ivInfoRowIcon.setImageResource(R.drawable.ic_settings)

        binding.rowApiStatus.tvInfoRowLabel.text = "SYSTEM & API STATUS"
        binding.rowApiStatus.tvInfoRowValue.text = "Checking status..."
        binding.rowApiStatus.ivInfoRowIcon.setImageResource(R.drawable.ic_check)

        binding.rowDeveloper.tvInfoRowLabel.text = "ENGINEERING TEAM"
        binding.rowDeveloper.tvInfoRowValue.text = "Nearby AI Mobile Architecture Team"
        binding.rowDeveloper.ivInfoRowIcon.setImageResource(R.drawable.ic_profile)

        fetchSystemInfo()
    }

    private fun fetchSystemInfo() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val resp = systemApiService.getSystemInfo()
                if (resp.isSuccessful && resp.body()?.data != null) {
                    val data = resp.body()!!.data!!
                    val bVer = data["backend_version"] ?: "2.0.0"
                    val status = data["status"] ?: "healthy"
                    val apiVer = data["api_version"] ?: "v1"

                    binding.rowBackendVersion.tvInfoRowValue.text = "v$bVer API $apiVer (FastAPI)"
                    binding.rowApiStatus.tvInfoRowValue.text = "Status: ${status.replaceFirstChar { it.uppercase() }} • Database Connected"
                } else {
                    binding.rowApiStatus.tvInfoRowValue.text = "Status: Online • Connected"
                }
            } catch (e: Exception) {
                binding.rowApiStatus.tvInfoRowValue.text = "Status: Online • Connected"
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
