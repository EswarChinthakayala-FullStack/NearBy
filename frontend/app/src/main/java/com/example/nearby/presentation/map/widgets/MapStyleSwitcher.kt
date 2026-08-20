package com.example.nearby.presentation.map.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout
import com.example.nearby.R

class MapStyleSwitcher @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    init {
        orientation = HORIZONTAL
        setBackgroundResource(R.drawable.bg_glass_panel)
        setPadding(16, 16, 16, 16)
    }
}
