package com.example.nearby.presentation.reviewform

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout

class RatingSelectorView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    init {
        orientation = HORIZONTAL
    }
}
