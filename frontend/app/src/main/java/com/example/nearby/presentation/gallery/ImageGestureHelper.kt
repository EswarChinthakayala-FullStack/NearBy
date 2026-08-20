package com.example.nearby.presentation.gallery

import android.view.MotionEvent

object ImageGestureHelper {
    fun isSwipeDownDismiss(initialY: Float, currentY: Float, thresholdPx: Float): Boolean {
        val deltaY = currentY - initialY
        return deltaY > thresholdPx
    }
}
