package com.example.nearby.designsystem

import android.content.Context
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatImageButton
import androidx.core.content.ContextCompat
import com.example.nearby.R

class PremiumIconButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatImageButton(context, attrs, defStyleAttr) {

    init {
        setBackgroundResource(R.drawable.bg_glass_panel)
        setColorFilter(ContextCompat.getColor(context, R.color.emerald_400))
        val p = (8 * resources.displayMetrics.density).toInt()
        setPadding(p, p, p, p)
    }
}
