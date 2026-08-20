package com.example.nearby.presentation.detail.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout
import com.example.nearby.R

class OpeningHoursCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    init {
        orientation = VERTICAL
        setBackgroundResource(R.drawable.bg_glass_panel)
        setPadding(32, 32, 32, 32)
    }
}
