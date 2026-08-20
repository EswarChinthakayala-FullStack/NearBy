package com.example.nearby.presentation.gallery

import android.content.Context
import android.graphics.Matrix
import android.graphics.PointF
import android.util.AttributeSet
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import androidx.appcompat.widget.AppCompatImageView

class ZoomableImageView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatImageView(context, attrs, defStyleAttr),
    ScaleGestureDetector.OnScaleGestureListener,
    GestureDetector.OnDoubleTapListener {

    private val imageMatrix = Matrix()
    private var mode = MODE_NONE

    private val lastTouch = PointF()
    private val startTouch = PointF()
    private var minScale = 1.0f
    private var maxScale = 4.0f
    private var currentScale = 1.0f

    private val matrixValues = FloatArray(9)
    private val scaleDetector = ScaleGestureDetector(context, this)
    private val gestureDetector = GestureDetector(context, GestureDetector.SimpleOnGestureListener()).apply {
        setOnDoubleTapListener(this@ZoomableImageView)
    }

    init {
        scaleType = ScaleType.MATRIX
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        scaleDetector.onTouchEvent(event)
        gestureDetector.onTouchEvent(event)

        val currentPoint = PointF(event.x, event.y)

        when (event.action and MotionEvent.ACTION_MASK) {
            MotionEvent.ACTION_DOWN -> {
                lastTouch.set(currentPoint)
                startTouch.set(lastTouch)
                mode = MODE_DRAG
            }
            MotionEvent.ACTION_MOVE -> {
                if (mode == MODE_DRAG) {
                    val deltaX = currentPoint.x - lastTouch.x
                    val deltaY = currentPoint.y - lastTouch.y
                    if (currentScale > minScale) {
                        imageMatrix.postTranslate(deltaX, deltaY)
                        imageMatrix.getValues(matrixValues)
                        setImageMatrix(imageMatrix)
                    }
                    lastTouch.set(currentPoint.x, currentPoint.y)
                }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                mode = MODE_NONE
            }
        }
        return true
    }

    override fun onScale(detector: ScaleGestureDetector): Boolean {
        var scaleFactor = detector.scaleFactor
        val origScale = currentScale
        currentScale *= scaleFactor

        if (currentScale > maxScale) {
            currentScale = maxScale
            scaleFactor = maxScale / origScale
        } else if (currentScale < minScale) {
            currentScale = minScale
            scaleFactor = minScale / origScale
        }

        imageMatrix.postScale(scaleFactor, scaleFactor, detector.focusX, detector.focusY)
        setImageMatrix(imageMatrix)
        return true
    }

    override fun onScaleBegin(detector: ScaleGestureDetector): Boolean {
        mode = MODE_ZOOM
        return true
    }

    override fun onScaleEnd(detector: ScaleGestureDetector) {
        mode = MODE_NONE
    }

    override fun onDoubleTap(e: MotionEvent): Boolean {
        if (currentScale > minScale) {
            imageMatrix.reset()
            currentScale = minScale
        } else {
            currentScale = 2.5f
            imageMatrix.postScale(2.5f, 2.5f, e.x, e.y)
        }
        setImageMatrix(imageMatrix)
        return true
    }

    override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
        performClick()
        return true
    }

    override fun onDoubleTapEvent(e: MotionEvent): Boolean = false

    companion object {
        private const val MODE_NONE = 0
        private const val MODE_DRAG = 1
        private const val MODE_ZOOM = 2
    }
}
