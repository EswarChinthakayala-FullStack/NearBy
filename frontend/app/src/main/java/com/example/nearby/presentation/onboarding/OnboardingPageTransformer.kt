package com.example.nearby.presentation.onboarding

import android.view.View
import androidx.viewpager2.widget.ViewPager2
import kotlin.math.abs

class OnboardingPageTransformer : ViewPager2.PageTransformer {

    private val MIN_SCALE = 0.85f
    private val MIN_ALPHA = 0.5f

    override fun transformPage(page: View, position: Float) {
        val pageWidth = page.width

        when {
            position < -1 -> { // [-Infinity,-1)
                page.alpha = 0f
            }
            position <= 1 -> { // [-1,1]
                val scaleFactor = MIN_SCALE.coerceAtLeast(1 - abs(position) * 0.15f)
                val vertMargin = page.height * (1 - scaleFactor) / 2
                val horzMargin = pageWidth * (1 - scaleFactor) / 2

                if (position < 0) {
                    page.translationX = horzMargin - vertMargin / 2
                } else {
                    page.translationX = -horzMargin + vertMargin / 2
                }

                page.scaleX = scaleFactor
                page.scaleY = scaleFactor
                page.alpha = MIN_ALPHA + (scaleFactor - MIN_SCALE) / (1 - MIN_SCALE) * (1 - MIN_ALPHA)
            }
            else -> { // (1,+Infinity]
                page.alpha = 0f
            }
        }
    }
}
