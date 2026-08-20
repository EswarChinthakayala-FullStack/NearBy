package com.example.nearby.presentation.detail.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout
import android.widget.TextView
import com.example.nearby.R

class ExpandableDescriptionView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    private val contentTv: TextView
    private val toggleTv: TextView
    private var isExpanded = false

    init {
        orientation = VERTICAL

        contentTv = TextView(context).apply {
            setTextAppearance(R.style.Typography_BodyMedium)
            setTextColor(context.getColor(R.color.text_primary))
            maxLines = 3
            ellipsize = android.text.TextUtils.TruncateAt.END
        }

        toggleTv = TextView(context).apply {
            setTextAppearance(R.style.Typography_Caption)
            setTextColor(context.getColor(R.color.emerald_500))
            text = "Read More  ▼"
            setPadding(0, 12, 0, 0)
        }

        addView(contentTv)
        addView(toggleTv)

        toggleTv.setOnClickListener {
            isExpanded = !isExpanded
            if (isExpanded) {
                contentTv.maxLines = Int.MAX_VALUE
                toggleTv.text = "Show Less  ▲"
            } else {
                contentTv.maxLines = 3
                toggleTv.text = "Read More  ▼"
            }
        }
    }

    fun setText(text: String) {
        contentTv.text = text
    }
}
