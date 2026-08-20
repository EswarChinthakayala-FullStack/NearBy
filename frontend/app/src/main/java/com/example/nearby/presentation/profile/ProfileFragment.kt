package com.example.nearby.presentation.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import coil3.load
import com.example.nearby.R
import com.example.nearby.data.local.SessionManager
import com.example.nearby.databinding.FragmentProfileBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.profile.adapter.ProfileMenuAdapter
import com.example.nearby.presentation.profile.dialog.LogoutConfirmationDrawer
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ProfileViewModel by viewModels()

    @Inject
    lateinit var sessionManager: SessionManager

    private var accountAdapter: ProfileMenuAdapter? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        setupToolbar()
        setupRecyclerViews()
        setupClickListeners()
        observeViewModel()
    }

    override fun onResume() {
        super.onResume()
        viewModel.loadProfileData()
    }

    private fun setupToolbar() {
        binding.profileToolbar.setTitle("My Account")
        binding.profileToolbar.setBackButtonVisible(false)

        binding.profileScrollView.setOnScrollChangeListener { _, _, scrollY, _, _ ->
            val name = viewModel.uiState.value.userName
            if (scrollY > 200) {
                binding.profileToolbar.setTitle(name.ifEmpty { "My Account" })
            } else {
                binding.profileToolbar.setTitle("My Account")
            }
        }
    }

    private fun setupRecyclerViews() {
        val myAccountItems = listOf(
            MenuItemData("edit_profile", "Edit Profile", "Update personal info, avatar and contact details", R.drawable.ic_profile),
            MenuItemData("my_trips", "My Trips", "View upcoming itineraries and trip history", R.drawable.ic_trips),
            MenuItemData("my_reviews", "My Reviews", "Ratings and feedback posted by you", R.drawable.ic_star),
            MenuItemData("saved_bookmarks", "Saved Favorites", "View and manage your bookmarked places", R.drawable.ic_bookmark),
            MenuItemData("settings", "Settings", "App theme, language, and storage", R.drawable.ic_settings),
            MenuItemData("help_center", "Help Center", "FAQs, 24/7 priority support and feedback", R.drawable.ic_compass)
        )

        accountAdapter = ProfileMenuAdapter(myAccountItems) { item ->
            when (item.id) {
                "edit_profile" -> navigateToEditProfile()
                "my_trips" -> navigateToMyTrips()
                "my_reviews" -> navigateToReviews()
                "saved_bookmarks" -> navigateToFavorites()
                "settings" -> navigateToSettings()
                "help_center" -> navigateToHelpSupport()
            }
        }

        binding.rvAccountMenu.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = accountAdapter
        }
    }

    private fun setupClickListeners() {
        binding.btnQuickEditProfile.setOnClickListener { navigateToEditProfile() }

        binding.rowFullName.root.setOnClickListener { navigateToEditProfile() }
        binding.rowUsername.root.setOnClickListener { navigateToEditProfile() }
        binding.rowPhone.root.setOnClickListener { navigateToEditProfile() }
        binding.rowLocation.root.setOnClickListener { navigateToEditProfile() }

        binding.cardStatTrips.setOnClickListener { navigateToMyTrips() }
        binding.cardStatReviews.setOnClickListener { navigateToReviews() }
        binding.cardStatSaved.setOnClickListener { navigateToFavorites() }

        binding.btnSignOut.setOnClickListener {
            val drawer = LogoutConfirmationDrawer(
                context = requireContext(),
                layoutInflater = layoutInflater,
                onLogoutConfirmed = {
                    lifecycleScope.launch {
                        sessionManager.clearSession()
                        activity?.let { act ->
                            EmeraldToastManager.showToast(act, "Signed Out", "You have been logged out.", EmeraldToastManager.Type.INFO)
                        }
                        findNavController().navigate(R.id.loginFragment)
                    }
                }
            )
            drawer.show()
        }
    }

    private fun navigateToEditProfile() {
        try {
            findNavController().navigate(R.id.action_profile_to_editProfile)
        } catch (e: Exception) {
            try {
                findNavController().navigate(R.id.editProfileFragment)
            } catch (ignored: Exception) {}
        }
    }

    private fun navigateToMyTrips() {
        try {
            findNavController().navigate(R.id.action_profile_to_myTrips)
        } catch (e: Exception) {
            try {
                findNavController().navigate(R.id.myTripsFragment)
            } catch (ignored: Exception) {}
        }
    }

    private fun navigateToReviews() {
        try {
            findNavController().navigate(R.id.action_profile_to_reviews)
        } catch (e: Exception) {
            try {
                findNavController().navigate(R.id.reviewsFragment)
            } catch (ignored: Exception) {}
        }
    }

    private fun navigateToFavorites() {
        try {
            findNavController().navigate(R.id.action_profile_to_favorites)
        } catch (e: Exception) {
            try {
                findNavController().navigate(R.id.favoritesFragment)
            } catch (ignored: Exception) {}
        }
    }

    private fun navigateToSettings() {
        try {
            findNavController().navigate(R.id.action_profile_to_settings)
        } catch (e: Exception) {
            try {
                findNavController().navigate(R.id.settingsFragment)
            } catch (ignored: Exception) {}
        }
    }

    private fun navigateToHelpSupport() {
        try {
            findNavController().navigate(R.id.action_profile_to_helpSupport)
        } catch (e: Exception) {
            try {
                findNavController().navigate(R.id.helpSupportFragment)
            } catch (ignored: Exception) {}
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    val name = state.userName.ifEmpty { "Traveler" }
                    binding.tvUserName.text = name
                    binding.tvUserHandle.text = "${state.username} • Level 4 Explorer"
                    binding.tvUserEmail.text = state.userEmail.ifEmpty { "traveler@example.com" }

                    binding.tvTripsCount.text = state.tripsCount.toString()
                    binding.tvReviewsCount.text = state.reviewsCount.toString()
                    binding.tvSavedCount.text = state.savedPlacesCount.toString()
                    binding.tvCountriesCount.text = state.countriesCount.toString()

                    val initial = if (name.isNotEmpty()) name.take(1).uppercase() else "T"
                    binding.tvUserInitial.text = initial

                    if (!state.userAvatarUrl.isNullOrEmpty()) {
                        binding.ivAvatar.visibility = View.VISIBLE
                        binding.tvUserInitial.visibility = View.GONE
                        binding.ivAvatar.load(state.userAvatarUrl)
                    } else {
                        binding.ivAvatar.visibility = View.GONE
                        binding.tvUserInitial.visibility = View.VISIBLE
                    }

                    // Personal info rows binding
                    binding.rowFullName.tvInfoRowLabel.text = "FULL NAME"
                    binding.rowFullName.tvInfoRowValue.text = name

                    binding.rowUsername.tvInfoRowLabel.text = "USERNAME"
                    binding.rowUsername.tvInfoRowValue.text = state.username

                    binding.rowPhone.tvInfoRowLabel.text = "PHONE NUMBER"
                    binding.rowPhone.tvInfoRowValue.text = state.userPhone.ifEmpty { "Not Provided" }

                    binding.rowLocation.tvInfoRowLabel.text = "LOCATION"
                    binding.rowLocation.tvInfoRowValue.text = state.userLocation
                }
            }
        }
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        binding.rvAccountMenu.adapter = null
        accountAdapter = null
        super.onDestroyView()
        _binding = null
    }
}
