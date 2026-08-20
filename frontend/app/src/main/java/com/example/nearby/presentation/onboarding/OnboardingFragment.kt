package com.example.nearby.presentation.onboarding

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.viewpager2.widget.ViewPager2
import com.example.nearby.R
import com.example.nearby.databinding.FragmentOnboardingBinding
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class OnboardingFragment : Fragment() {

    private var _binding: FragmentOnboardingBinding? = null
    private val binding get() = _binding!!

    private val viewModel: OnboardingViewModel by viewModels()

    private val onboardingPages = listOf(
        OnboardingPage(
            title = "Discover Hidden Destinations",
            subtitle = "Find breathtaking tourist attractions, local gems, and unforgettable experiences near you.",
            iconResId = R.drawable.ic_app_logo
        ),
        OnboardingPage(
            title = "Navigate with Smart Maps",
            subtitle = "Explore places effortlessly with real-time maps, intelligent search, and seamless navigation.",
            iconResId = R.drawable.ic_app_logo
        ),
        OnboardingPage(
            title = "Plan and Save Your Journey",
            subtitle = "Save favorite places, create travel plans, and enjoy a personalized tourism experience.",
            iconResId = R.drawable.ic_app_logo
        )
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOnboardingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        setupViewPager()
        setupButtons()
    }

    private fun setupViewPager() {
        binding.viewPagerOnboarding.adapter = OnboardingAdapter(onboardingPages)

        // Attach custom parallax depth page transformer
        binding.viewPagerOnboarding.setPageTransformer(OnboardingPageTransformer())

        binding.viewPagerOnboarding.registerOnPageChangeCallback(object :
            ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                updateUIState(position)
            }
        })
    }

    private fun updateUIState(position: Int) {
        val lastIndex = onboardingPages.size - 1

        // Update dot indicator states
        updateDot(binding.dot0, position == 0)
        updateDot(binding.dot1, position == 1)
        updateDot(binding.dot2, position == 2)

        // Previous button visibility
        binding.btnPrev.visibility = if (position > 0) View.VISIBLE else View.GONE

        // Skip button visibility
        binding.btnSkip.visibility = if (position < lastIndex) View.VISIBLE else View.GONE

        // Next vs Get Started button visibility
        if (position == lastIndex) {
            binding.btnNext.visibility = View.GONE
            binding.btnGetStarted.visibility = View.VISIBLE
        } else {
            binding.btnNext.visibility = View.VISIBLE
            binding.btnGetStarted.visibility = View.GONE
        }
    }

    private fun updateDot(dot: View, isActive: Boolean) {
        val params = dot.layoutParams
        params.width = if (isActive) 28.dpToPx() else 8.dpToPx()
        dot.layoutParams = params
        dot.background = if (isActive) {
            ContextCompat.getDrawable(requireContext(), R.drawable.bg_button_primary)
        } else {
            ContextCompat.getDrawable(requireContext(), R.color.zinc_300)
        }
    }

    private fun setupButtons() {
        binding.btnNext.setOnClickListener {
            val current = binding.viewPagerOnboarding.currentItem
            if (current < onboardingPages.size - 1) {
                binding.viewPagerOnboarding.currentItem = current + 1
            }
        }

        binding.btnPrev.setOnClickListener {
            val current = binding.viewPagerOnboarding.currentItem
            if (current > 0) {
                binding.viewPagerOnboarding.currentItem = current - 1
            }
        }

        binding.btnSkip.setOnClickListener {
            finishOnboarding()
        }

        binding.btnGetStarted.setOnClickListener {
            finishOnboarding()
        }
    }

    private fun finishOnboarding() {
        viewModel.completeOnboarding {
            val controller = findNavController()
            if (controller.currentDestination?.id == R.id.onboardingFragment) {
                controller.navigate(R.id.action_onboarding_to_login)
            }
        }
    }

    private fun Int.dpToPx(): Int {
        return (this * resources.displayMetrics.density).toInt()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
