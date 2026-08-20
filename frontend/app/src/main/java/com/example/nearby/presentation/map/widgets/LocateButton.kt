package com.example.nearby.presentation.map.widgets

import android.content.Context
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatImageButton
import com.example.nearby.R

class LocateButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatImageButton(context, attrs, defStyleAttr) {

    init {
        setBackgroundResource(R.drawable.bg_glass_panel)
        setImageResource(R.drawable.ic_map)
        contentDescription = "My Location"
    }
}
