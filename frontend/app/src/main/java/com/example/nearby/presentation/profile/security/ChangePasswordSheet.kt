package com.example.nearby.presentation.profile.security

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ObjectAnimator
import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import com.example.nearby.R
import com.example.nearby.databinding.LayoutChangePasswordSheetBinding
import com.example.nearby.presentation.profile.edit.ProfileValidator

class ChangePasswordSheet(
    context: Context,
    private val onSubmitPassword: (current: String, newPass: String, onError: (String) -> Unit, onSuccess: () -> Unit) -> Unit
) : Dialog(context, R.style.Theme_Nearby_Dialog) {

    private lateinit var binding: LayoutChangePasswordSheetBinding

    private var initialTouchY = 0f
    private var isDragging = false
    private val dismissThresholdPx by lazy { (160 * context.resources.displayMetrics.density) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = LayoutChangePasswordSheetBinding.inflate(LayoutInflater.from(context))
        setContentView(binding.root)

        setupDialogWindow()
        setupListeners()
        setupDragDownToDismiss()
    }

    private fun setupDialogWindow() {
        window?.let { win ->
            win.setLayout(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT
            )
            win.setGravity(Gravity.BOTTOM)
            win.setBackgroundDrawableResource(android.R.color.transparent)
            win.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
            win.setDimAmount(0.65f)
            win.setWindowAnimations(android.R.style.Animation_InputMethod)
        }
    }

    private fun setupDragDownToDismiss() {
        val touchListener = View.OnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialTouchY = event.rawY
                    isDragging = true
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    if (!isDragging) return@OnTouchListener false
                    val deltaY = event.rawY - initialTouchY
                    if (deltaY > 0) {
                        binding.root.translationY = deltaY
                    }
                    true
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    if (!isDragging) return@OnTouchListener false
                    isDragging = false
                    val deltaY = binding.root.translationY
                    if (deltaY > dismissThresholdPx) {
                        animateDismiss()
                    } else {
                        animateSpringBack()
                    }
                    true
                }
                else -> false
            }
        }
        binding.root.setOnTouchListener(touchListener)
    }

    private fun animateDismiss() {
        val targetY = binding.root.height.toFloat().coerceAtLeast(800f)
        ObjectAnimator.ofFloat(binding.root, "translationY", targetY).apply {
            duration = 200
            interpolator = DecelerateInterpolator()
            addListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    dismiss()
                }
            })
            start()
        }
    }

    private fun animateSpringBack() {
        ObjectAnimator.ofFloat(binding.root, "translationY", 0f).apply {
            duration = 300
            interpolator = OvershootInterpolator(1.2f)
            start()
        }
    }

    private fun setupListeners() {
        binding.btnCloseChangePass.setOnClickListener { dismiss() }

        binding.etNewPassword.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val strength = ProfileValidator.calculatePasswordStrength(s?.toString() ?: "")
                binding.tvPasswordStrength.text = "Strength: $strength"
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnSubmitChangePass.setOnClickListener {
            val current = binding.etCurrentPassword.text.toString()
            val newPass = binding.etNewPassword.text.toString()
            val confirm = binding.etConfirmPassword.text.toString()

            if (current.isEmpty() || newPass.isEmpty()) {
                binding.tvChangePassError.text = "Please enter current and new password."
                binding.tvChangePassError.visibility = View.VISIBLE
            } else if (newPass != confirm) {
                binding.tvChangePassError.text = "New passwords do not match."
                binding.tvChangePassError.visibility = View.VISIBLE
            } else {
                binding.tvChangePassError.visibility = View.GONE
                onSubmitPassword(
                    current,
                    newPass,
                    { err ->
                        binding.tvChangePassError.text = err
                        binding.tvChangePassError.visibility = View.VISIBLE
                    },
                    {
                        dismiss()
                    }
                )
            }
        }
    }
}
