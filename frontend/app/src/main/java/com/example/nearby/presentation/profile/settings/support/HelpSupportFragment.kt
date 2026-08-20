package com.example.nearby.presentation.profile.settings.support

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.databinding.FragmentHelpSupportBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class HelpSupportFragment : Fragment() {

    private var _binding: FragmentHelpSupportBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHelpSupportBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        binding.supportToolbar.setTitle("Help & Support")
        binding.supportToolbar.setBackButtonVisible(true)
        binding.supportToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }

        binding.rowFaq.tvInfoRowLabel.text = "FREQUENTLY ASKED QUESTIONS"
        binding.rowFaq.tvInfoRowValue.text = "Browse Travel & App FAQs"
        binding.rowFaq.ivInfoRowIcon.setImageResource(R.drawable.ic_search)

        binding.rowContactSupport.tvInfoRowLabel.text = "PRIORITY TRAVEL SUPPORT"
        binding.rowContactSupport.tvInfoRowValue.text = "Contact 24/7 Support Team"
        binding.rowContactSupport.ivInfoRowIcon.setImageResource(R.drawable.ic_check)

        binding.rowReportIssue.tvInfoRowLabel.text = "BUG REPORT"
        binding.rowReportIssue.tvInfoRowValue.text = "Report a Technical Issue"
        binding.rowReportIssue.ivInfoRowIcon.setImageResource(R.drawable.ic_settings)

        binding.rowSendFeedback.tvInfoRowLabel.text = "PRODUCT FEEDBACK"
        binding.rowSendFeedback.tvInfoRowValue.text = "Send Feature Request & Suggestions"
        binding.rowSendFeedback.ivInfoRowIcon.setImageResource(R.drawable.ic_star)

        binding.rowFaq.root.setOnClickListener {
            showToast("Opening Travel FAQs...")
        }

        binding.rowContactSupport.root.setOnClickListener {
            val intent = Intent(Intent.ACTION_SENDTO).apply {
                data = Uri.parse("mailto:support@nearbyapp.com")
                putExtra(Intent.EXTRA_SUBJECT, "Nearby App Support Request")
            }
            try {
                startActivity(intent)
            } catch (e: Exception) {
                showToast("Email support: support@nearbyapp.com")
            }
        }

        binding.rowReportIssue.root.setOnClickListener {
            showToast("Bug report submitted. Thank you!")
        }

        binding.rowSendFeedback.root.setOnClickListener {
            showToast("Thank you for sharing your feedback!")
        }
    }

    private fun showToast(msg: String) {
        activity?.let { act ->
            EmeraldToastManager.showToast(act, "Help & Support", msg, EmeraldToastManager.Type.INFO)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
