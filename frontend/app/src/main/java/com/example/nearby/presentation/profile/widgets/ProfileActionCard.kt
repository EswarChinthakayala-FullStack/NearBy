package com.example.nearby.presentation.profile.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout

class ProfileActionCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    init {
        orientation = HORIZONTAL
    }
}
