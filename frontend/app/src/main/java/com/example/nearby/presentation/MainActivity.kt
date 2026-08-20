package com.example.nearby.presentation

import android.content.res.ColorStateList
import android.os.Bundle
import android.view.View
import android.view.ViewGroup.MarginLayoutParams
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updateLayoutParams
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import com.example.nearby.R
import com.example.nearby.databinding.ActivityMainBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.main.MainViewModel
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    @javax.inject.Inject
    lateinit var favoriteManager: com.example.nearby.presentation.favorites.FavoriteManager

    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        WindowInsetsHelper.setupEdgeToEdge(this)

        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        setupWindowInsets()
        setupBottomNavListeners()
        setupNavigationListener()
        observeViewModel()
    }

    private fun setupWindowInsets() {
        WindowInsetsHelper.applyBottomNavMargin(binding.incMainBottomNav.mainBottomNavContainer, 16)
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { _, insets ->
            val statusBarTop = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
            binding.viewStatusBarBackdrop.updateLayoutParams<android.view.ViewGroup.LayoutParams> {
                height = statusBarTop
            }
            insets
        }
        ViewCompat.requestApplyInsets(binding.root)
    }

    private fun setupBottomNavListeners() {
        binding.incMainBottomNav.navTabHome.setOnClickListener {
            if (navController.currentDestination?.id != R.id.homeFragment) {
                navController.navigate(R.id.homeFragment)
            }
        }

        binding.incMainBottomNav.navTabExplore.setOnClickListener {
            if (navController.currentDestination?.id != R.id.exploreFragment) {
                navController.navigate(R.id.exploreFragment)
            }
        }

        binding.incMainBottomNav.navTabAiNearby.setOnClickListener {
            if (navController.currentDestination?.id != R.id.aiNearbyFragment) {
                navController.navigate(R.id.aiNearbyFragment)
            }
        }

        binding.incMainBottomNav.navTabSaved.setOnClickListener {
            if (navController.currentDestination?.id != R.id.itineraryFragment) {
                navController.navigate(R.id.itineraryFragment)
            }
        }

        binding.incMainBottomNav.navTabProfile.setOnClickListener {
            if (navController.currentDestination?.id != R.id.profileFragment) {
                navController.navigate(R.id.profileFragment)
            }
        }
    }

    private fun setupNavigationListener() {
        navController.addOnDestinationChangedListener { _, destination, _ ->
            viewModel.updateDestination(destination.id)
            val showBottomNav = when (destination.id) {
                R.id.homeFragment, R.id.exploreFragment, R.id.aiNearbyFragment, R.id.itineraryFragment, R.id.profileFragment -> true
                else -> false
            }
            binding.incMainBottomNav.mainBottomNavContainer.visibility =
                if (showBottomNav) View.VISIBLE else View.GONE

            updateBottomNavTabHighlighting(destination.id)
        }
    }

    private fun updateBottomNavTabHighlighting(destinationId: Int) {
        val activeColor = ContextCompat.getColor(this, R.color.emerald_400)
        val inactiveColor = ContextCompat.getColor(this, R.color.text_secondary)

        val isHome = destinationId == R.id.homeFragment
        val isExplore = destinationId == R.id.exploreFragment
        val isAiNearby = destinationId == R.id.aiNearbyFragment
        val isItinerary = destinationId == R.id.itineraryFragment
        val isProfile = destinationId == R.id.profileFragment

        updateTabState(binding.incMainBottomNav.navTabHome, binding.incMainBottomNav.ivNavHome, binding.incMainBottomNav.tvNavHome, isHome, activeColor, inactiveColor)
        updateTabState(binding.incMainBottomNav.navTabExplore, binding.incMainBottomNav.ivNavExplore, binding.incMainBottomNav.tvNavExplore, isExplore, activeColor, inactiveColor)
        updateTabState(binding.incMainBottomNav.navTabAiNearby, binding.incMainBottomNav.ivNavAiNearby, binding.incMainBottomNav.tvNavAiNearby, isAiNearby, activeColor, inactiveColor)
        updateTabState(binding.incMainBottomNav.navTabSaved, binding.incMainBottomNav.ivNavSaved, binding.incMainBottomNav.tvNavSaved, isItinerary, activeColor, inactiveColor)
        updateTabState(binding.incMainBottomNav.navTabProfile, binding.incMainBottomNav.ivNavProfile, binding.incMainBottomNav.tvNavProfile, isProfile, activeColor, inactiveColor)
    }

    private fun updateTabState(
        container: View,
        icon: android.widget.ImageView,
        text: android.widget.TextView,
        isActive: Boolean,
        activeColor: Int,
        inactiveColor: Int
    ) {
        if (isActive) {
            container.setBackgroundResource(R.drawable.bg_bottom_nav_active_pill)
            text.setTextColor(activeColor)
            text.typeface = android.graphics.Typeface.DEFAULT_BOLD
            icon.imageTintList = ColorStateList.valueOf(activeColor)
            container.animate().scaleX(1.02f).scaleY(1.02f).setDuration(120).start()
        } else {
            container.background = null
            text.setTextColor(inactiveColor)
            text.typeface = android.graphics.Typeface.DEFAULT
            icon.imageTintList = ColorStateList.valueOf(inactiveColor)
            container.animate().scaleX(1.0f).scaleY(1.0f).setDuration(120).start()
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    binding.layoutOfflineBanner.visibility =
                        if (state.isOffline) View.VISIBLE else View.GONE
                }
            }
        }

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                favoriteManager.toastEvents.collect { event ->
                    val type = when (event.type) {
                        com.example.nearby.presentation.favorites.FavoriteToastType.SUCCESS -> EmeraldToastManager.Type.SUCCESS
                        com.example.nearby.presentation.favorites.FavoriteToastType.ERROR -> EmeraldToastManager.Type.ERROR
                        com.example.nearby.presentation.favorites.FavoriteToastType.INFO -> EmeraldToastManager.Type.INFO
                    }
                    EmeraldToastManager.showToast(this@MainActivity, event.title, event.message, type)
                }
            }
        }
    }

    private fun Int.dpToPx(): Int {
        return (this * resources.displayMetrics.density).toInt()
    }

    override fun onDestroy() {
        com.tourismguide.app.common.util.InputMethodLeakFixer.fixInputMethodManagerLeak(this)
        super.onDestroy()
    }
}
