package com.example.nearby.designsystem

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.example.nearby.R

class GridBackgroundView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.emerald_500)
        alpha = 22 // Subtle 8.5% opacity for fine emerald grid lines
        strokeWidth = 1.0f
        style = Paint.Style.STROKE
    }

    private val gridSpacingPx = (10 * resources.displayMetrics.density) // 10dp fine grid spacing matching bg_grid_pattern

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()

        if (w <= 0f || h <= 0f) return

        // Vertical grid lines
        var x = 0f
        while (x <= w) {
            canvas.drawLine(x, 0f, x, h, gridPaint)
            x += gridSpacingPx
        }

        // Horizontal grid lines
        var y = 0f
        while (y <= h) {
            canvas.drawLine(0f, y, w, y, gridPaint)
            y += gridSpacingPx
        }
    }
}
