package com.example.nearby.presentation.detail.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.FrameLayout
import android.widget.ImageView
import coil3.load
import com.example.nearby.R

class HeroImageCarousel @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val imageView = ImageView(context).apply {
        layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        scaleType = ImageView.ScaleType.CENTER_CROP
        setImageResource(R.drawable.bg_wave_top)
    }

    init {
        addView(imageView)
    }

    fun setImage(url: String?) {
        if (!url.isNullOrEmpty()) {
            imageView.load(url)
        }
    }
}
