package com.example.nearby.presentation.profile.reviews.dialog

import android.app.Dialog
import android.content.Context
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.view.animation.AccelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.widget.TextView
import com.example.nearby.R

class DeleteReviewConfirmationDialog(
    context: Context,
    private val placeName: String,
    private val onConfirmDelete: () -> Unit
) : Dialog(context, R.style.Theme_Nearby_Dialog) {

    private val root: View = LayoutInflater.from(context).inflate(R.layout.dialog_delete_review, null, false)
    private val tvExplanation: TextView? = root.findViewById(R.id.tvDeleteExplanation)
    private val btnCancel: TextView? = root.findViewById(R.id.btnCancelDelete)
    private val btnDelete: TextView? = root.findViewById(R.id.btnConfirmDelete)

    init {
        setContentView(root)
        setupWindow()

        tvExplanation?.text = "Are you sure you want to delete your review for '$placeName'? This action cannot be undone."

        btnCancel?.setOnClickListener { dismissWithAnimation() }
        btnDelete?.setOnClickListener {
            dismissWithAnimation()
            onConfirmDelete()
        }
    }

    private fun setupWindow() {
        window?.let { win ->
            win.setLayout(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT
            )
            win.setGravity(Gravity.BOTTOM)
            win.setBackgroundDrawableResource(android.R.color.transparent)
            win.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
            win.setDimAmount(0.65f)
        }
    }

    override fun show() {
        try {
            if (isShowing) return
            root.visibility = View.VISIBLE
            super.show()

            root.translationY = 500f
            root.animate()
                .translationY(0f)
                .setDuration(220)
                .setInterpolator(DecelerateInterpolator())
                .start()
        } catch (e: Exception) {
            Log.e("DeleteReviewDialog", "Error showing delete dialog: ${e.message}", e)
        }
    }

    private fun dismissWithAnimation() {
        try {
            if (!isShowing) return
            root.animate()
                .translationY(root.height.toFloat().coerceAtLeast(400f))
                .setDuration(180)
                .setInterpolator(AccelerateInterpolator())
                .withEndAction {
                    try {
                        if (isShowing) dismiss()
                    } catch (ignored: Exception) {}
                }
                .start()
        } catch (e: Exception) {
            try {
                if (isShowing) dismiss()
            } catch (ignored: Exception) {}
        }
    }
}
