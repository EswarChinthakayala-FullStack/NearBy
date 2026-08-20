package com.example.nearby.designsystem.components

import android.animation.ObjectAnimator
import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.LinearInterpolator
import android.widget.FrameLayout
import com.example.nearby.R
import com.example.nearby.databinding.ViewLoadingButtonBinding

class LoadingButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    enum class State {
        NORMAL, LOADING, SUCCESS, ERROR
    }

    private val binding: ViewLoadingButtonBinding =
        ViewLoadingButtonBinding.inflate(LayoutInflater.from(context), this, true)

    private var currentState: State = State.NORMAL
    private var spinnerAnimator: ObjectAnimator? = null
    private var defaultText: String = "Submit"
    private var defaultLoadingText: String = "Loading..."
    private var clickListener: OnClickListener? = null

    init {
        attrs?.let {
            val typedArray = context.obtainStyledAttributes(it, R.styleable.LoadingButton, 0, 0)
            val btnText = typedArray.getString(R.styleable.LoadingButton_buttonText)
            val loadText = typedArray.getString(R.styleable.LoadingButton_loadingText)

            if (!btnText.isNullOrEmpty()) {
                defaultText = btnText
                binding.tvButtonText.text = btnText
            }
            if (!loadText.isNullOrEmpty()) {
                defaultLoadingText = loadText
                binding.tvLoadingText.text = loadText
            }
            typedArray.recycle()
        }

        setupSpinnerAnimator()

        // Delegate internal container click to root LoadingButton click listener
        binding.loadingButtonContainer.setOnClickListener { v ->
            if (isEnabled && currentState == State.NORMAL) {
                clickListener?.onClick(this)
            }
        }
        super.setOnClickListener { v ->
            if (isEnabled && currentState == State.NORMAL) {
                clickListener?.onClick(this)
            }
        }
    }

    override fun setOnClickListener(l: OnClickListener?) {
        clickListener = l
    }

    private fun setupSpinnerAnimator() {
        spinnerAnimator = ObjectAnimator.ofFloat(binding.ivRadialSpinner, View.ROTATION, 0f, 360f).apply {
            duration = 900
            repeatCount = ObjectAnimator.INFINITE
            interpolator = LinearInterpolator()
        }
    }

    fun setButtonText(text: String) {
        defaultText = text
        if (currentState == State.NORMAL) {
            binding.tvButtonText.text = text
        }
    }

    fun startLoading(loadingText: String? = null) {
        if (currentState == State.LOADING) return
        currentState = State.LOADING
        isEnabled = false

        val textToDisplay = loadingText ?: defaultLoadingText
        binding.tvLoadingText.text = textToDisplay

        // Animate out Normal text, animate in Radial Spinner + Loading Text
        binding.tvButtonText.animate().alpha(0f).setDuration(150).withEndAction {
            binding.tvButtonText.visibility = View.GONE
            binding.layoutLoadingContainer.visibility = View.VISIBLE
            binding.layoutLoadingContainer.alpha = 0f
            binding.layoutLoadingContainer.animate().alpha(1f).setDuration(150).start()
            spinnerAnimator?.start()
        }.start()
    }

    fun stopLoading() {
        if (currentState != State.LOADING) return
        spinnerAnimator?.cancel()
        currentState = State.NORMAL
        isEnabled = true

        binding.layoutLoadingContainer.animate().alpha(0f).setDuration(150).withEndAction {
            binding.layoutLoadingContainer.visibility = View.GONE
            binding.tvButtonText.visibility = View.VISIBLE
            binding.tvButtonText.alpha = 0f
            binding.tvButtonText.text = defaultText
            binding.tvButtonText.animate().alpha(1f).setDuration(150).start()
        }.start()
    }

    fun showSuccess(successText: String? = null, onComplete: (() -> Unit)? = null) {
        currentState = State.SUCCESS
        spinnerAnimator?.cancel()

        binding.layoutLoadingContainer.animate().alpha(0f).setDuration(150).withEndAction {
            binding.layoutLoadingContainer.visibility = View.GONE
            binding.ivSuccessCheck.visibility = View.VISIBLE
            binding.ivSuccessCheck.alpha = 0f
            binding.ivSuccessCheck.scaleX = 0.5f
            binding.ivSuccessCheck.scaleY = 0.5f

            binding.ivSuccessCheck.animate()
                .alpha(1f)
                .scaleX(1.2f)
                .scaleY(1.2f)
                .setDuration(250)
                .setInterpolator(AccelerateDecelerateInterpolator())
                .withEndAction {
                    binding.ivSuccessCheck.animate().scaleX(1f).scaleY(1f).setDuration(100).withEndAction {
                        postDelayed({ onComplete?.invoke() }, 300)
                    }.start()
                }.start()
        }.start()
    }

    fun showError(errorText: String? = null, onComplete: (() -> Unit)? = null) {
        currentState = State.ERROR
        spinnerAnimator?.cancel()

        // Horizontal Shake Animation (450ms)
        this.animate()
            .translationXBy(20f)
            .setDuration(50)
            .withEndAction {
                this.animate().translationXBy(-40f).setDuration(100).withEndAction {
                    this.animate().translationXBy(30f).setDuration(100).withEndAction {
                        this.animate().translationXBy(-20f).setDuration(100).withEndAction {
                            this.animate().translationX(0f).setDuration(50).withEndAction {
                                stopLoading()
                                onComplete?.invoke()
                            }.start()
                        }.start()
                    }.start()
                }.start()
            }.start()
    }

    override fun setEnabled(enabled: Boolean) {
        super.setEnabled(enabled)
        binding.loadingButtonContainer.isEnabled = enabled
        this.alpha = if (enabled) 1f else 0.5f
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        spinnerAnimator?.cancel()
        removeCallbacks(null)
        clickListener = null
        this.animate().cancel()
        binding.tvButtonText.animate().cancel()
        binding.layoutLoadingContainer.animate().cancel()
        binding.ivSuccessCheck.animate().cancel()
    }
}
