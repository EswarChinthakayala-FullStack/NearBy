package com.example.nearby.presentation.favorites.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout
import com.example.nearby.R

class FavoriteStatisticsCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    init {
        orientation = HORIZONTAL
        setBackgroundResource(R.drawable.bg_glass_panel)
        setPadding(24, 24, 24, 24)
    }
}
