package com.example.nearby.presentation.auth.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ProgressBar
import com.example.nearby.R

class PremiumLoadingButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val button: Button
    private val progressBar: ProgressBar

    init {
        button = Button(context).apply {
            setTextAppearance(R.style.Typography_Button)
            setBackgroundResource(R.drawable.bg_button_primary)
            setTextColor(context.getColor(R.color.white))
            text = "Continue  →"
        }

        progressBar = ProgressBar(context).apply {
            visibility = GONE
            indeterminateDrawable?.setTint(context.getColor(R.color.white))
        }

        addView(button, LayoutParams(LayoutParams.MATCH_PARENT, 130))
        addView(progressBar, LayoutParams(64, 64, android.view.Gravity.CENTER))
    }

    fun setText(text: String) { button.text = text }
    fun setLoading(isLoading: Boolean) {
        if (isLoading) {
            button.text = ""
            button.isEnabled = false
            progressBar.visibility = VISIBLE
        } else {
            button.isEnabled = true
            progressBar.visibility = GONE
        }
    }

    override fun setOnClickListener(listener: OnClickListener?) {
        button.setOnClickListener(listener)
    }
}
