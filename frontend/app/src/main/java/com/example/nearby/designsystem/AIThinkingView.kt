package com.example.nearby.designsystem

import android.animation.ObjectAnimator
import android.animation.PropertyValuesHolder
import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import androidx.lifecycle.findViewTreeLifecycleOwner
import androidx.lifecycle.lifecycleScope
import com.example.nearby.R
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class AIThinkingView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    private val tvStep: TextView
    private val pbIndicator: View
    private var rotationJob: Job? = null
    private var pulseAnimator: ObjectAnimator? = null

    private val thinkingMessages = listOf(
        "Analyzing your travel request...",
        "Finding top-rated attractions...",
        "Checking live weather forecasts...",
        "Calculating optimal OSRM routes...",
        "Finalizing your personalized itinerary..."
    )

    init {
        orientation = HORIZONTAL
        gravity = android.view.Gravity.CENTER
        setPadding(24, 16, 24, 16)
        setBackgroundResource(R.drawable.bg_glass_panel)

        val view = LayoutInflater.from(context).inflate(R.layout.widget_ai_typing, this, true)
        tvStep = view.findViewById(R.id.tv_ai_thinking_step)
        pbIndicator = view.findViewById(R.id.pb_ai_thinking)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        startThinkingAnimation()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopThinkingAnimation()
    }

    fun startThinkingAnimation() {
        stopThinkingAnimation()

        // Pulse scale animation on indicator
        pulseAnimator = ObjectAnimator.ofPropertyValuesHolder(
            pbIndicator,
            PropertyValuesHolder.ofFloat(View.SCALE_X, 1.0f, 1.25f, 1.0f),
            PropertyValuesHolder.ofFloat(View.SCALE_Y, 1.0f, 1.25f, 1.0f)
        ).apply {
            duration = 1000
            repeatCount = ObjectAnimator.INFINITE
            start()
        }

        // Rotate status messages every 2.5s
        val lifecycleOwner = findViewTreeLifecycleOwner()
        if (lifecycleOwner != null) {
            rotationJob = lifecycleOwner.lifecycleScope.launch {
                var index = 0
                while (true) {
                    tvStep.text = thinkingMessages[index % thinkingMessages.size]
                    index++
                    delay(2500)
                }
            }
        }
    }

    fun stopThinkingAnimation() {
        pulseAnimator?.cancel()
        pulseAnimator = null
        rotationJob?.cancel()
        rotationJob = null
    }

    fun setThinkingStep(stepText: String) {
        tvStep.text = stepText
    }
}
