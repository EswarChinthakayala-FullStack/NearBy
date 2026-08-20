package com.example.nearby.designsystem

import android.content.Context
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import com.example.nearby.R

class PremiumActionButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatButton(context, attrs, defStyleAttr) {

    init {
        setBackgroundResource(R.drawable.bg_button_primary)
        setTextColor(ContextCompat.getColor(context, R.color.white))
        textSize = 15f
        isAllCaps = false
        elevation = 4f * resources.displayMetrics.density
    }
}
