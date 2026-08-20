package com.example.nearby.presentation.profile.editprofile

import android.Manifest
import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import coil3.load
import coil3.request.crossfade
import com.example.nearby.R
import com.example.nearby.databinding.FragmentEditProfileBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.navigation.NavigationLocationManager
import com.example.nearby.presentation.profile.editprofile.dialog.DiscardChangesDrawer
import com.example.nearby.presentation.profile.editprofile.dialog.LocationSelectionDrawer
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
import javax.inject.Inject

@AndroidEntryPoint
class EditProfileFragment : Fragment() {

    private var _binding: FragmentEditProfileBinding? = null
    private val binding get() = _binding!!

    private val viewModel: EditProfileViewModel by viewModels()

    @Inject
    lateinit var navigationLocationManager: NavigationLocationManager

    private val selectImageLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let { handleSelectedImageUri(it) }
    }

    private val requestLocationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            autoDetectGpsLocation()
        } else {
            activity?.let {
                EmeraldToastManager.showToast(it, "Location Permission", "Location permission is required to auto-detect GPS position.", EmeraldToastManager.Type.WARNING)
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentEditProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        setupToolbar()
        setupInputs()
        setupClickListeners()
        observeUiState()
    }

    private fun setupToolbar() {
        binding.editProfileToolbar.setTitle("Edit Profile")
        binding.editProfileToolbar.setBackButtonVisible(true)
        binding.editProfileToolbar.setOnBackClickListener {
            handleBackPress()
        }
    }

    private fun handleBackPress() {
        if (viewModel.uiState.value.isModified) {
            val drawer = DiscardChangesDrawer(
                context = requireContext(),
                layoutInflater = layoutInflater,
                onDiscard = { findNavController().navigateUp() }
            )
            drawer.show()
        } else {
            findNavController().navigateUp()
        }
    }

    private fun setupInputs() {
        binding.etFullName.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.onFullNameChanged(s?.toString() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.etUsername.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.onUsernameChanged(s?.toString() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.etPhone.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.onPhoneChanged(s?.toString() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.etBio.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val text = s?.toString() ?: ""
                binding.tvBioCharCount.text = "${text.length} / 250"
                viewModel.onBioChanged(text)
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun setupClickListeners() {
        binding.btnChangeAvatar.setOnClickListener {
            selectImageLauncher.launch("image/*")
        }

        binding.btnGenderMale.setOnClickListener { selectGender("Male") }
        binding.btnGenderFemale.setOnClickListener { selectGender("Female") }
        binding.btnGenderOther.setOnClickListener { selectGender("Other") }

        binding.btnAutoDetectLocation.setOnClickListener {
            if (navigationLocationManager.hasLocationPermission(requireContext())) {
                autoDetectGpsLocation()
            } else {
                requestLocationPermissionLauncher.launch(
                    arrayOf(
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    )
                )
            }
        }

        binding.btnSelectCountry.setOnClickListener {
            val countries = listOf(
                "United States", "India", "United Kingdom", "Canada", "Australia",
                "Germany", "France", "Japan", "Singapore", "United Arab Emirates",
                "Italy", "Spain", "Switzerland", "Netherlands", "Brazil", "Mexico"
            )
            val drawer = LocationSelectionDrawer(requireContext(), layoutInflater, "Select Country", countries) { selected ->
                viewModel.onCountrySelected(selected)
            }
            drawer.show()
        }

        binding.btnSelectState.setOnClickListener {
            val states = listOf(
                "California", "New York", "Texas", "Florida", "Washington", "Illinois",
                "Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "Ontario",
                "London Area", "Bavaria", "Île-de-France", "Tokyo Prefecture"
            )
            val drawer = LocationSelectionDrawer(requireContext(), layoutInflater, "Select State / Region", states) { selected ->
                viewModel.onStateSelected(selected)
            }
            drawer.show()
        }

        binding.btnSelectCity.setOnClickListener {
            val cities = listOf(
                "San Francisco", "Los Angeles", "New York City", "Miami", "Chicago", "Seattle",
                "Mumbai", "New Delhi", "Bengaluru", "Hyderabad", "Toronto", "London",
                "Paris", "Berlin", "Tokyo", "Dubai", "Singapore", "Rome"
            )
            val drawer = LocationSelectionDrawer(requireContext(), layoutInflater, "Select City", cities) { selected ->
                viewModel.onCitySelected(selected)
            }
            drawer.show()
        }

        binding.btnSaveProfile.setOnClickListener {
            viewModel.saveProfile()
        }
    }

    private fun autoDetectGpsLocation() {
        activity?.let { act ->
            EmeraldToastManager.showToast(act, "Detecting GPS", "Fetching current location via GPS reverse geocoding...", EmeraldToastManager.Type.INFO)
        }

        viewLifecycleOwner.lifecycleScope.launch {
            val latLng = navigationLocationManager.getInitialUserLocation(requireContext())
            viewModel.reverseGeocodeLocation(latLng.latitude, latLng.longitude) { success, msg ->
                activity?.let { act ->
                    val type = if (success) EmeraldToastManager.Type.SUCCESS else EmeraldToastManager.Type.ERROR
                    EmeraldToastManager.showToast(act, "Location GPS", msg, type)
                }
            }
        }
    }

    private fun selectGender(gender: String) {
        viewModel.onGenderSelected(gender)
        renderGenderButtons(gender)
    }

    private fun renderGenderButtons(gender: String) {
        val selectedBg = R.drawable.bg_button_primary
        val unselectedBg = R.drawable.bg_glass_panel

        val whiteColor = ContextCompat.getColor(requireContext(), R.color.white)
        val mutedColor = ContextCompat.getColor(requireContext(), R.color.text_secondary)

        binding.btnGenderMale.setBackgroundResource(if (gender.equals("Male", true)) selectedBg else unselectedBg)
        binding.btnGenderMale.setTextColor(if (gender.equals("Male", true)) whiteColor else mutedColor)

        binding.btnGenderFemale.setBackgroundResource(if (gender.equals("Female", true)) selectedBg else unselectedBg)
        binding.btnGenderFemale.setTextColor(if (gender.equals("Female", true)) whiteColor else mutedColor)

        binding.btnGenderOther.setBackgroundResource(if (gender.equals("Other", true)) selectedBg else unselectedBg)
        binding.btnGenderOther.setTextColor(if (gender.equals("Other", true)) whiteColor else mutedColor)
    }

    private fun observeUiState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    renderUiState(state)
                }
            }
        }
    }

    private fun renderUiState(state: EditProfileUiState) {
        if (!binding.etFullName.isFocused && binding.etFullName.text.toString() != state.fullName) {
            binding.etFullName.setText(state.fullName)
        }

        if (!binding.etUsername.isFocused && binding.etUsername.text.toString() != state.username) {
            binding.etUsername.setText(state.username)
        }

        binding.etEmail.setText(state.email)

        if (!binding.etPhone.isFocused && binding.etPhone.text.toString() != state.phone) {
            binding.etPhone.setText(state.phone)
        }

        if (!binding.etBio.isFocused && binding.etBio.text.toString() != state.bio) {
            binding.etBio.setText(state.bio)
            binding.tvBioCharCount.text = "${state.bio.length} / 250"
        }

        binding.btnSelectCountry.text = "Country: ${state.country}"
        binding.btnSelectState.text = "State: ${state.state}"
        binding.btnSelectCity.text = "City: ${state.city}"

        renderGenderButtons(state.gender)

        // Avatar
        if (!state.avatarUrl.isNullOrEmpty()) {
            binding.ivEditAvatar.visibility = View.VISIBLE
            binding.tvEditAvatarInitial.visibility = View.GONE
            binding.ivEditAvatar.load(state.avatarUrl) {
                crossfade(true)
            }
        } else {
            val initial = if (state.fullName.isNotBlank()) state.fullName.take(1).uppercase() else "A"
            binding.tvEditAvatarInitial.text = initial
            binding.ivEditAvatar.visibility = View.GONE
            binding.tvEditAvatarInitial.visibility = View.VISIBLE
        }

        // Error message
        if (!state.fullNameError.isNullOrEmpty()) {
            binding.tvErrorFullName.visibility = View.VISIBLE
            binding.tvErrorFullName.text = state.fullNameError
        } else {
            binding.tvErrorFullName.visibility = View.GONE
        }

        // Saving State
        if (state.isSaving) {
            binding.btnSaveProfile.text = "Saving Changes..."
            binding.btnSaveProfile.isEnabled = false
        } else {
            binding.btnSaveProfile.text = "Save Profile Changes  →"
            binding.btnSaveProfile.isEnabled = true
        }

        // Success State
        if (state.isSuccess) {
            binding.layoutSaveSuccessOverlay.visibility = View.VISIBLE
            viewLifecycleOwner.lifecycleScope.launch {
                delay(1200)
                findNavController().navigateUp()
            }
        }

        // Error Toast
        state.errorMessage?.let { msg ->
            activity?.let {
                EmeraldToastManager.showToast(it, "Update Error", msg, EmeraldToastManager.Type.ERROR)
            }
        }
    }

    private fun handleSelectedImageUri(uri: Uri) {
        try {
            val inputStream = requireContext().contentResolver.openInputStream(uri)
            val tempFile = File.createTempFile("avatar_", ".jpg", requireContext().cacheDir)
            val outputStream = FileOutputStream(tempFile)
            inputStream?.copyTo(outputStream)
            inputStream?.close()
            outputStream.close()

            binding.ivEditAvatar.visibility = View.VISIBLE
            binding.tvEditAvatarInitial.visibility = View.GONE
            binding.ivEditAvatar.setImageURI(uri)

            viewModel.onAvatarFileSelected(tempFile)
        } catch (e: Exception) {
            activity?.let {
                EmeraldToastManager.showToast(it, "Image Error", "Could not load selected photo.", EmeraldToastManager.Type.ERROR)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
