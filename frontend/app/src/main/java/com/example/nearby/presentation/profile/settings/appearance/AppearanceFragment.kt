package com.example.nearby.presentation.profile.settings.appearance

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatDelegate
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.databinding.FragmentAppearanceBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class AppearanceFragment : Fragment() {

    private var _binding: FragmentAppearanceBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAppearanceBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        binding.appearanceToolbar.setTitle("Appearance & Theme")
        binding.appearanceToolbar.setBackButtonVisible(true)
        binding.appearanceToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }

        val currentNightMode = AppCompatDelegate.getDefaultNightMode()
        updateBadges(currentNightMode)

        binding.cardThemeSystem.setOnClickListener {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
            updateBadges(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
            showToast("System Theme Selected")
        }

        binding.cardThemeLight.setOnClickListener {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
            updateBadges(AppCompatDelegate.MODE_NIGHT_NO)
            showToast("Light Theme Activated")
        }

        binding.cardThemeDark.setOnClickListener {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
            updateBadges(AppCompatDelegate.MODE_NIGHT_YES)
            showToast("Dark Theme Activated")
        }
    }

    private fun updateBadges(mode: Int) {
        val activeBg = R.drawable.bg_button_primary
        val inactiveBg = R.drawable.bg_glass_panel

        val whiteColor = requireContext().getColor(R.color.white)
        val mutedColor = requireContext().getColor(R.color.text_muted)

        val isSystem = mode == AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM || mode == AppCompatDelegate.MODE_NIGHT_UNSPECIFIED
        val isLight = mode == AppCompatDelegate.MODE_NIGHT_NO
        val isDark = mode == AppCompatDelegate.MODE_NIGHT_YES

        binding.tvBadgeSystem.setBackgroundResource(if (isSystem) activeBg else inactiveBg)
        binding.tvBadgeSystem.setTextColor(if (isSystem) whiteColor else mutedColor)
        binding.tvBadgeSystem.text = if (isSystem) "Active" else "Select"

        binding.tvBadgeLight.setBackgroundResource(if (isLight) activeBg else inactiveBg)
        binding.tvBadgeLight.setTextColor(if (isLight) whiteColor else mutedColor)
        binding.tvBadgeLight.text = if (isLight) "Active" else "Select"

        binding.tvBadgeDark.setBackgroundResource(if (isDark) activeBg else inactiveBg)
        binding.tvBadgeDark.setTextColor(if (isDark) whiteColor else mutedColor)
        binding.tvBadgeDark.text = if (isDark) "Active" else "Select"
    }

    private fun showToast(msg: String) {
        activity?.let { act ->
            EmeraldToastManager.showToast(act, "Theme Preference", msg, EmeraldToastManager.Type.SUCCESS)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
