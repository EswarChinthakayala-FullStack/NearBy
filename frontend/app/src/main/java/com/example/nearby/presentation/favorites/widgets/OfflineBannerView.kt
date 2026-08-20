package com.example.nearby.presentation.favorites.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout
import android.widget.TextView
import com.example.nearby.R

class OfflineBannerView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    init {
        orientation = HORIZONTAL
        setBackgroundResource(R.drawable.bg_button_primary)
        setPadding(24, 16, 24, 16)

        val tv = TextView(context).apply {
            setTextAppearance(R.style.Typography_Caption)
            setTextColor(context.getColor(R.color.white))
            text = "⚡ Offline Mode — Showing locally saved favorites from Room"
        }
        addView(tv)
    }
}
