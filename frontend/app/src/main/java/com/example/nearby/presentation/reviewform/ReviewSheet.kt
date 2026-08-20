package com.example.nearby.presentation.reviewform

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ObjectAnimator
import android.app.Dialog
import android.content.Context
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import androidx.core.content.ContextCompat
import com.example.nearby.R
import com.example.nearby.databinding.LayoutReviewSheetBinding

class ReviewSheet(
    context: Context,
    private val onSubmitSuccess: (rating: Float, comment: String) -> Unit
) : Dialog(context, R.style.Theme_Nearby_Dialog) {

    private val binding: LayoutReviewSheetBinding = LayoutReviewSheetBinding.inflate(LayoutInflater.from(context))
    private var selectedRating = 5.0f

    private var initialTouchY = 0f
    private var isDragging = false
    private val dismissThresholdPx by lazy { (160 * context.resources.displayMetrics.density) }

    init {
        setContentView(binding.root)
        setupDialogWindow()
        setupListeners()
        setupDragDownToDismiss()
        setRating(5.0f)
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
        binding.btnCloseReview.setOnClickListener { dismiss() }

        binding.star1.setOnClickListener { setRating(1f) }
        binding.star2.setOnClickListener { setRating(2f) }
        binding.star3.setOnClickListener { setRating(3f) }
        binding.star4.setOnClickListener { setRating(4f) }
        binding.star5.setOnClickListener { setRating(5f) }

        binding.btnSubmitReview.setOnClickListener {
            val text = binding.etReviewText.text?.toString()?.trim() ?: ""
            val validation = ReviewValidator.validate(selectedRating, text)
            if (!validation.isValid) {
                binding.tvReviewError.text = validation.errorMessage
                binding.tvReviewError.visibility = View.VISIBLE
            } else {
                binding.tvReviewError.visibility = View.GONE
                onSubmitSuccess(selectedRating, text)
                dismiss()
            }
        }
    }

    private fun setRating(rating: Float) {
        selectedRating = rating
        val yellow = ContextCompat.getColor(context, R.color.amber_400)
        val muted = ContextCompat.getColor(context, R.color.zinc_700)

        binding.star1.setTextColor(if (rating >= 1) yellow else muted)
        binding.star2.setTextColor(if (rating >= 2) yellow else muted)
        binding.star3.setTextColor(if (rating >= 3) yellow else muted)
        binding.star4.setTextColor(if (rating >= 4) yellow else muted)
        binding.star5.setTextColor(if (rating >= 5) yellow else muted)
    }
}
