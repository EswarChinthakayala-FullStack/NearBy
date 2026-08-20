package com.example.nearby.designsystem

import android.app.Dialog
import android.content.Context
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.view.animation.AccelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.example.nearby.R

class CustomBottomDrawer(
    context: Context
) : Dialog(context, R.style.Theme_Nearby_Dialog) {

    private val drawerRoot: View = LayoutInflater.from(context).inflate(R.layout.view_custom_bottom_drawer, null, false)
    private val drawerScrim: View = drawerRoot.findViewById(R.id.drawer_scrim)
    private val drawerSheet: LinearLayout = drawerRoot.findViewById(R.id.drawer_sheet)
    private val tvDrawerTitle: TextView = drawerRoot.findViewById(R.id.tv_drawer_title)
    private val btnDrawerClose: ImageView = drawerRoot.findViewById(R.id.btn_drawer_close)
    private val contentContainer: FrameLayout = drawerRoot.findViewById(R.id.drawer_content_container)

    init {
        drawerRoot.visibility = View.VISIBLE
        setContentView(drawerRoot)
        setupDialogWindow()

        drawerScrim.setOnClickListener { dismissWithAnimation() }
        btnDrawerClose.setOnClickListener { dismissWithAnimation() }
    }

    private fun setupDialogWindow() {
        window?.let { win ->
            win.setLayout(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT
            )
            win.setGravity(Gravity.BOTTOM)
            win.setBackgroundDrawableResource(android.R.color.transparent)
            win.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
            win.setDimAmount(0.60f)
        }
    }

    fun setTitle(title: String) {
        tvDrawerTitle.text = title
    }

    fun setCustomContentView(customView: View) {
        contentContainer.removeAllViews()
        contentContainer.addView(customView)
    }

    override fun show() {
        try {
            if (isShowing) return
            drawerRoot.visibility = View.VISIBLE
            super.show()

            drawerScrim.alpha = 0f
            drawerScrim.animate().alpha(1f).setDuration(200).start()

            drawerSheet.translationY = 600f
            drawerSheet.animate()
                .translationY(0f)
                .setDuration(250)
                .setInterpolator(DecelerateInterpolator())
                .start()
        } catch (e: Exception) {
            Log.e("CustomBottomDrawer", "Error showing bottom drawer: ${e.message}", e)
        }
    }

    fun dismissWithAnimation() {
        try {
            if (!isShowing) return
            drawerScrim.animate().alpha(0f).setDuration(160).start()
            drawerSheet.animate()
                .translationY(drawerSheet.height.toFloat().coerceAtLeast(500f))
                .setDuration(200)
                .setInterpolator(AccelerateInterpolator())
                .withEndAction {
                    try {
                        if (isShowing) {
                            dismiss()
                        }
                    } catch (e: Exception) {
                        Log.w("CustomBottomDrawer", "Error dismissing dialog: ${e.message}")
                    }
                }
                .start()
        } catch (e: Exception) {
            try {
                if (isShowing) dismiss()
            } catch (ignored: Exception) {}
        }
    }
}
