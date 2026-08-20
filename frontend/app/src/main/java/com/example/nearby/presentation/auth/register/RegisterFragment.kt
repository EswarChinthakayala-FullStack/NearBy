package com.example.nearby.presentation.auth.register

import android.os.Bundle
import android.text.InputType
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.example.nearby.R
import com.example.nearby.databinding.FragmentRegisterBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.profile.edit.ProfileValidator
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class RegisterFragment : Fragment() {

    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!

    private val viewModel: RegisterViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        // STEP 1 INPUTS
        binding.etRegName.doAfterTextChanged {
            viewModel.onEvent(RegisterEvent.NameChanged(it?.toString() ?: ""))
        }
        binding.etRegEmail.doAfterTextChanged {
            viewModel.onEvent(RegisterEvent.EmailChanged(it?.toString() ?: ""))
        }

        // STEP 2 INPUTS
        var isRegPassVisible = false
        binding.btnToggleRegPassword.setOnClickListener {
            isRegPassVisible = !isRegPassVisible
            if (isRegPassVisible) {
                binding.etRegPassword.inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
                binding.btnToggleRegPassword.setImageResource(R.drawable.ic_eye)
            } else {
                binding.etRegPassword.inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
                binding.btnToggleRegPassword.setImageResource(R.drawable.ic_eye_off)
            }
            binding.etRegPassword.setSelection(binding.etRegPassword.text.length)
        }

        binding.etRegPassword.doAfterTextChanged {
            val pass = it?.toString() ?: ""
            viewModel.onEvent(RegisterEvent.PasswordChanged(pass))
            val strength = ProfileValidator.calculatePasswordStrength(pass)
            binding.tvRegPasswordStrength.text = "Password Strength: $strength"
        }
        binding.etRegConfirmPassword.doAfterTextChanged {
            viewModel.onEvent(RegisterEvent.ConfirmPasswordChanged(it?.toString() ?: ""))
        }

        // STEP 3 INPUTS
        binding.etRegPhone.doAfterTextChanged {
            viewModel.onEvent(RegisterEvent.PhoneChanged(it?.toString() ?: ""))
        }

        // ACTION BUTTONS
        binding.btnRegPrev.setOnClickListener {
            viewModel.onEvent(RegisterEvent.PreviousStep)
        }

        binding.btnRegNext.setOnClickListener {
            val currentStep = viewModel.uiState.value.currentStep
            if (currentStep < 3) {
                viewModel.onEvent(RegisterEvent.NextStep)
            } else {
                viewModel.onEvent(RegisterEvent.SubmitRegister)
            }
        }

        binding.tvLinkLogin.setOnClickListener {
            findNavController().navigateUp()
        }

        observeViewModel()
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        updateStepUI(state.currentStep, state.isLoading, state.errorMessage)
                    }
                }
                launch {
                    viewModel.effectFlow.collect { effect ->
                        when (effect) {
                            is RegisterEffect.NavigateToHome -> {
                                findNavController().navigate(R.id.action_register_to_home)
                            }
                            is RegisterEffect.ShowToast -> {
                                activity?.let { act ->
                                    EmeraldToastManager.showToast(act, effect.title, effect.message, EmeraldToastManager.Type.INFO)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private fun updateStepUI(step: Int, isLoading: Boolean, errorMessage: String?) {
        val state = viewModel.uiState.value
        val primaryDrawable = requireContext().getDrawable(R.drawable.bg_button_primary)

        // Update progress bar step indicators
        binding.stepIndicator1.background = primaryDrawable
        binding.stepIndicator2.background = if (step >= 2) primaryDrawable else requireContext().getDrawable(R.color.zinc_700)
        binding.stepIndicator3.background = if (step >= 3) primaryDrawable else requireContext().getDrawable(R.color.zinc_700)

        when (step) {
            1 -> binding.tvStepHeader.text = "STEP 1 OF 3: BASIC INFORMATION"
            2 -> binding.tvStepHeader.text = "STEP 2 OF 3: ACCOUNT SECURITY"
            3 -> {
                binding.tvStepHeader.text = "STEP 3 OF 3: PROFILE & ACCOUNT SUMMARY"
                binding.tvSummaryName.text = "Name: ${state.name.ifEmpty { "Alex Rivera" }}"
                binding.tvSummaryEmail.text = "Email: ${state.email.ifEmpty { "alex.rivera@example.com" }}"
            }
        }

        binding.containerStep1.visibility = if (step == 1) View.VISIBLE else View.GONE
        binding.containerStep2.visibility = if (step == 2) View.VISIBLE else View.GONE
        binding.containerStep3.visibility = if (step == 3) View.VISIBLE else View.GONE

        binding.btnRegPrev.visibility = if (step > 1) View.VISIBLE else View.GONE

        binding.btnRegNext.isEnabled = !isLoading
        if (step == 3) {
            binding.btnRegNext.text = if (isLoading) "Creating Account..." else "Create Account  →"
        } else {
            binding.btnRegNext.text = "Continue  →"
        }

        if (errorMessage != null) {
            binding.tvRegError.text = errorMessage
            binding.tvRegError.visibility = View.VISIBLE
        } else {
            binding.tvRegError.visibility = View.GONE
        }
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        super.onDestroyView()
        _binding = null
    }
}
