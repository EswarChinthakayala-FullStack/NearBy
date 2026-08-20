package com.example.nearby.designsystem

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.nearby.R

object EmeraldToastManager {

    enum class Type { SUCCESS, ERROR, WARNING, INFO }

    private var activeToastView: View? = null
    private val handler = Handler(Looper.getMainLooper())

    fun showToast(
        activity: Activity,
        title: String,
        message: String,
        type: Type = Type.INFO,
        durationMs: Long = 3500
    ) {
        handler.post {
            dismissActiveToast()

            val decorView = activity.window.decorView as? ViewGroup ?: return@post
            val inflater = LayoutInflater.from(activity)
            val toastView = inflater.inflate(R.layout.view_emerald_toast, decorView, false)

            val titleTv = toastView.findViewById<TextView>(R.id.toast_title)
            val messageTv = toastView.findViewById<TextView>(R.id.toast_message)
            val iconIv = toastView.findViewById<ImageView>(R.id.toast_icon)

            titleTv.text = title
            messageTv.text = message

            when (type) {
                Type.SUCCESS -> iconIv.setImageResource(R.drawable.ic_check)
                Type.ERROR -> iconIv.setImageResource(R.drawable.ic_close)
                Type.WARNING, Type.INFO -> iconIv.setImageResource(R.drawable.ic_notification)
            }

            // Calculate status bar inset to position toast safely below status bar
            val insets = ViewCompat.getRootWindowInsets(decorView)
            val statusBarTop = insets?.getInsets(WindowInsetsCompat.Type.statusBars())?.top
                ?: (44 * activity.resources.displayMetrics.density).toInt()
            val targetMarginTop = statusBarTop + (12 * activity.resources.displayMetrics.density).toInt()

            val lp = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = targetMarginTop
            }
            toastView.layoutParams = lp

            toastView.translationY = -150f
            toastView.alpha = 0f

            decorView.addView(toastView)
            activeToastView = toastView

            toastView.animate()
                .translationY(0f)
                .alpha(1f)
                .setDuration(300)
                .setInterpolator(DecelerateInterpolator())
                .start()

            handler.postDelayed({
                dismissToast(toastView, decorView)
            }, durationMs)
        }
    }

    private fun dismissActiveToast() {
        activeToastView?.let { view ->
            (view.parent as? ViewGroup)?.removeView(view)
            activeToastView = null
        }
    }

    private fun dismissToast(toastView: View, container: ViewGroup) {
        toastView.animate()
            .translationY(-150f)
            .alpha(0f)
            .setDuration(250)
            .withEndAction {
                container.removeView(toastView)
                if (activeToastView == toastView) {
                    activeToastView = null
                }
            }
            .start()
    }
}
