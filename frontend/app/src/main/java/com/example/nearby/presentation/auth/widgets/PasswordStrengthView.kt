package com.example.nearby.presentation.auth.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout
import android.widget.TextView
import com.example.nearby.R
import com.example.nearby.presentation.profile.edit.ProfileValidator

class PasswordStrengthView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    private val tvStrength: TextView

    init {
        orientation = HORIZONTAL
        tvStrength = TextView(context).apply {
            setTextAppearance(R.style.Typography_Caption)
            setTextColor(context.getColor(R.color.emerald_500))
            text = "Password Strength: None"
        }
        addView(tvStrength)
    }

    fun updatePassword(password: String) {
        val strength = ProfileValidator.calculatePasswordStrength(password)
        tvStrength.text = "Password Strength: $strength"
    }
}
