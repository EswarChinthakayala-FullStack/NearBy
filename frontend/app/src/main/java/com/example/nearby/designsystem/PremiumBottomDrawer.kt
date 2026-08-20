package com.example.nearby.designsystem

import android.view.View
import android.view.animation.DecelerateInterpolator

class PremiumBottomDrawer(
    private val drawerRoot: View,
    private val drawerPanel: View,
    private val scrimView: View
) {

    init {
        scrimView.setOnClickListener { close() }
    }

    fun open() {
        drawerRoot.visibility = View.VISIBLE
        scrimView.alpha = 0f
        scrimView.animate().alpha(1f).setDuration(250).start()

        drawerPanel.translationY = drawerPanel.height.toFloat().coerceAtLeast(1000f)
        drawerPanel.animate()
            .translationY(0f)
            .setDuration(300)
            .setInterpolator(DecelerateInterpolator())
            .start()
    }

    fun close() {
        scrimView.animate().alpha(0f).setDuration(200).start()
        drawerPanel.animate()
            .translationY(drawerPanel.height.toFloat().coerceAtLeast(1000f))
            .setDuration(250)
            .withEndAction {
                drawerRoot.visibility = View.GONE
            }
            .start()
    }
}
