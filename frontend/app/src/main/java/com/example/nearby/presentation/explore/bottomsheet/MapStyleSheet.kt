package com.example.nearby.presentation.explore.bottomsheet

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.Gravity
import android.view.WindowManager
import com.example.nearby.R

class MapStyleSheet(
    context: Context,
    private val currentStyle: String,
    private val onStyleSelected: (String) -> Unit
) : Dialog(context, R.style.Theme_Nearby_Dialog) {

    private val styles = listOf("Standard", "Satellite", "Dark Emerald", "Terrain")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val container = android.widget.LinearLayout(context).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
            setBackgroundResource(R.drawable.bg_glass_card)
        }

        val title = android.widget.TextView(context).apply {
            text = "Map Layer Style"
            setTextAppearance(R.style.Typography_HeadlineSmall)
            setTextColor(context.getColor(R.color.text_primary))
            setPadding(0, 0, 0, 24)
        }
        container.addView(title)

        styles.forEach { style ->
            val option = android.widget.TextView(context).apply {
                text = style
                setTextAppearance(R.style.Typography_BodyLarge)
                setTextColor(if (style == currentStyle) context.getColor(R.color.emerald_500) else context.getColor(R.color.text_secondary))
                setPadding(16, 24, 16, 24)
                setBackgroundResource(R.drawable.bg_chip)
                setOnClickListener {
                    onStyleSelected(style)
                    dismiss()
                }
            }
            val lp = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(0, 8, 0, 8) }
            container.addView(option, lp)
        }

        setContentView(container)

        window?.let { win ->
            win.setLayout(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT
            )
            win.setGravity(Gravity.BOTTOM)
            win.setBackgroundDrawableResource(android.R.color.transparent)
        }
    }
}
