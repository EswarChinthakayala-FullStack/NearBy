package com.example.nearby.presentation.profile.security

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.tourismguide.app.common.widgets.toolbar.PremiumToolbar
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class SecurityFragment : Fragment() {

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
            setTitle("Security & Sessions")
            setBackVisible(true)
            setOnBackClickListener { findNavController().navigateUp() }
        }
        val title = TextView(requireContext()).apply {
            setTextAppearance(R.style.Typography_HeadlineMedium)
            text = "Account Security Controls"
            setTextColor(requireContext().getColor(R.color.text_primary))
            setPadding(32, 32, 32, 32)
        }
        root.addView(toolbar)
        root.addView(title)
        return root
    }
}
