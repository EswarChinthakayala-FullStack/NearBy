package com.example.nearby.presentation.auth.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout
import android.widget.TextView
import com.example.nearby.R

class CountryPickerView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    init {
        orientation = HORIZONTAL
        setBackgroundResource(R.drawable.bg_input_field)
        setPadding(32, 24, 32, 24)

        val text = TextView(context).apply {
            setTextAppearance(R.style.Typography_BodyMedium)
            setTextColor(context.getColor(R.color.text_primary))
            text = "🇺🇸 United States (+1)"
        }
        addView(text)
    }
}
