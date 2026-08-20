package com.example.nearby.presentation.favorites.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import com.example.nearby.R

class EmptyFavoritesView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    init {
        orientation = VERTICAL
        gravity = android.view.Gravity.CENTER
        setPadding(48, 64, 48, 64)

        val title = TextView(context).apply {
            setTextAppearance(R.style.Typography_HeadlineMedium)
            setTextColor(context.getColor(R.color.text_primary))
            text = "No Saved Places Yet"
        }

        val subtitle = TextView(context).apply {
            setTextAppearance(R.style.Typography_BodySmall)
            setTextColor(context.getColor(R.color.text_secondary))
            text = "Explore destinations and tap the heart icon to save them for offline access."
            setPadding(0, 12, 0, 24)
            gravity = android.view.Gravity.CENTER
        }

        val exploreBtn = Button(context).apply {
            setTextAppearance(R.style.Typography_Button)
            setBackgroundResource(R.drawable.bg_button_primary)
            setTextColor(context.getColor(R.color.white))
            text = "Explore Places  →"
            setPadding(32, 16, 32, 16)
        }

        addView(title)
        addView(subtitle)
        addView(exploreBtn)
    }
}
