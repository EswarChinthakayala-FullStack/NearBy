package com.example.nearby.presentation.profile.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.designsystem.GridBackgroundView
import com.tourismguide.app.common.widgets.toolbar.PremiumToolbar
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ThemeFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val root = FrameLayout(requireContext()).apply {
            setBackgroundResource(R.drawable.bg_screen_gradient)
        }
        val gridBg = GridBackgroundView(requireContext())
        val content = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
        }
        val toolbar = PremiumToolbar(requireContext()).apply {
            setTitle("Theme Options")
            setBackVisible(true)
            setOnBackClickListener { findNavController().navigateUp() }
        }
        val title = TextView(requireContext()).apply {
            setTextAppearance(R.style.Typography_HeadlineMedium)
            text = "Select Application Theme"
            setTextColor(requireContext().getColor(R.color.text_primary))
            setPadding(32, 32, 32, 32)
        }
        content.addView(toolbar)
        content.addView(title)

        root.addView(gridBg)
        root.addView(content)
        return root
    }
}
