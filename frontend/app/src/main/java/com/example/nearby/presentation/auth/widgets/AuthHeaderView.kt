package com.example.nearby.presentation.auth.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.example.nearby.R

class AuthHeaderView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    private val tvTitle: TextView
    private val tvSubtitle: TextView

    init {
        orientation = VERTICAL
        gravity = android.view.Gravity.CENTER_HORIZONTAL
        setPadding(0, 32, 0, 24)

        val logo = ImageView(context).apply {
            setImageResource(R.drawable.ic_app_logo)
            layoutParams = LayoutParams(72, 72).apply { bottomMargin = 16 }
        }

        tvTitle = TextView(context).apply {
            setTextAppearance(R.style.Typography_HeadlineLarge)
            setTextColor(context.getColor(R.color.text_primary))
            text = "Welcome Back"
        }

        tvSubtitle = TextView(context).apply {
            setTextAppearance(R.style.Typography_BodyMedium)
            setTextColor(context.getColor(R.color.text_secondary))
            text = "Sign in to access your personal travel guide"
            setPadding(0, 8, 0, 0)
        }

        addView(logo)
        addView(tvTitle)
        addView(tvSubtitle)
    }

    fun setTitle(title: String) { tvTitle.text = title }
    fun setSubtitle(subtitle: String) { tvSubtitle.text = subtitle }
}
