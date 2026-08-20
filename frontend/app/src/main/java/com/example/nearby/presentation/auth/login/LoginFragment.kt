package com.example.nearby.presentation.auth.login

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
import com.example.nearby.databinding.FragmentLoginBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.utils.WindowInsetsHelper
import com.tourismguide.app.common.util.InputMethodLeakFixer
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val viewModel: LoginViewModel by viewModels()
    private var isPasswordVisible = false

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        binding.etLoginEmail.doAfterTextChanged {
            viewModel.onEvent(LoginEvent.EmailChanged(it?.toString() ?: ""))
        }

        binding.etLoginPassword.doAfterTextChanged {
            viewModel.onEvent(LoginEvent.PasswordChanged(it?.toString() ?: ""))
        }

        binding.btnTogglePassword.setOnClickListener {
            isPasswordVisible = !isPasswordVisible
            if (isPasswordVisible) {
                binding.etLoginPassword.inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
                binding.btnTogglePassword.setImageResource(R.drawable.ic_eye)
            } else {
                binding.etLoginPassword.inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
                binding.btnTogglePassword.setImageResource(R.drawable.ic_eye_off)
            }
            binding.etLoginPassword.setSelection(binding.etLoginPassword.text.length)
        }

        binding.tvForgotPassword.setOnClickListener {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Reset Link Sent", "Check your email inbox for password reset instructions.", EmeraldToastManager.Type.INFO)
            }
        }

        binding.btnLoginSubmit.setOnClickListener {
            viewModel.onEvent(LoginEvent.SubmitLogin)
        }



        binding.tvLinkRegister.setOnClickListener {
            findNavController().navigate(R.id.action_login_to_register)
        }

        observeViewModel()
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        binding.btnLoginSubmit.isEnabled = !state.isLoading
                        binding.btnLoginSubmit.text = if (state.isLoading) "Signing In..." else "Sign In  →"

                        if (state.errorMessage != null) {
                            binding.tvLoginError.text = state.errorMessage
                            binding.tvLoginError.visibility = View.VISIBLE
                        } else {
                            binding.tvLoginError.visibility = View.GONE
                        }
                    }
                }
                launch {
                    viewModel.effectFlow.collect { effect ->
                        when (effect) {
                            is LoginEffect.NavigateToHome -> {
                                val controller = findNavController()
                                if (controller.currentDestination?.id == R.id.loginFragment) {
                                    controller.navigate(R.id.action_login_to_home)
                                }
                            }
                            is LoginEffect.ShowToast -> {
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

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        super.onDestroyView()
        _binding = null
    }
}
