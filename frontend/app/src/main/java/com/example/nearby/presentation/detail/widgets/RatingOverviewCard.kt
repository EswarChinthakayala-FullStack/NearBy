package com.example.nearby.presentation.detail.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout
import android.widget.TextView
import com.example.nearby.R

class RatingOverviewCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    private val ratingTv: TextView
    private val reviewsTv: TextView

    init {
        orientation = HORIZONTAL
        setBackgroundResource(R.drawable.bg_glass_panel)
        setPadding(32, 24, 32, 24)

        ratingTv = TextView(context).apply {
            setTextAppearance(R.style.Typography_HeadlineLarge)
            setTextColor(context.getColor(R.color.emerald_500))
        }
        reviewsTv = TextView(context).apply {
            setTextAppearance(R.style.Typography_BodySmall)
            setTextColor(context.getColor(R.color.text_secondary))
            setPadding(16, 0, 0, 0)
        }

        addView(ratingTv)
        addView(reviewsTv)
    }

    fun setRating(rating: String, totalReviews: Int) {
        ratingTv.text = "★ $rating"
        reviewsTv.text = "Based on $totalReviews traveler reviews"
    }
}
