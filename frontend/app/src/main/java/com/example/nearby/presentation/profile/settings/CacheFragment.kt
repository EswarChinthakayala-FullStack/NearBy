package com.example.nearby.presentation.profile.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.designsystem.EmeraldToastManager
import com.tourismguide.app.common.widgets.toolbar.PremiumToolbar
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class CacheFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val root = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundResource(R.drawable.bg_screen_gradient)
        }
        val toolbar = PremiumToolbar(requireContext()).apply {
            setTitle("Storage & Cache")
            setBackVisible(true)
            setOnBackClickListener { findNavController().navigateUp() }
        }
        val title = TextView(requireContext()).apply {
            setTextAppearance(R.style.Typography_HeadlineMedium)
            text = "Storage & Offline Map Usage (42 MB)"
            setTextColor(requireContext().getColor(R.color.text_primary))
            setPadding(32, 32, 32, 32)
        }
        val clearBtn = Button(requireContext()).apply {
            setTextAppearance(R.style.Typography_Button)
            setBackgroundResource(R.drawable.bg_button_primary)
            setTextColor(requireContext().getColor(R.color.white))
            text = "Clear Image & Map Cache"
            setOnClickListener {
                activity?.let { act ->
                    EmeraldToastManager.showToast(act, "Storage Cleared", "42 MB cleared", EmeraldToastManager.Type.SUCCESS)
                }
            }
        }
        root.addView(toolbar)
        root.addView(title)
        root.addView(clearBtn)
        return root
    }
}
