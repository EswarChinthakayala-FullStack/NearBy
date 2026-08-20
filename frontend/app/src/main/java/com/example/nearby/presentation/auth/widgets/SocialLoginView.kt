package com.example.nearby.presentation.auth.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.Button
import android.widget.LinearLayout
import com.example.nearby.R

class SocialLoginView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    init {
        orientation = HORIZONTAL
        gravity = android.view.Gravity.CENTER

        val googleBtn = Button(context).apply {
            setTextAppearance(R.style.Typography_Button)
            setBackgroundResource(R.drawable.bg_neutral_pill)
            setTextColor(context.getColor(R.color.text_primary))
            text = "Continue with Google"
            setPadding(32, 16, 32, 16)
        }
        addView(googleBtn)
    }
}
