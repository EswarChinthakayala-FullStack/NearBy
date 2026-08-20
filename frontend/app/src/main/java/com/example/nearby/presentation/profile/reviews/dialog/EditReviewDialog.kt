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
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.example.nearby.R
import com.example.nearby.presentation.profile.reviews.model.UserReviewDomainModel

class EditReviewDialog(
    context: Context,
    private val review: UserReviewDomainModel,
    private val onSave: (rating: Float, title: String?, comment: String) -> Unit
) : Dialog(context, R.style.Theme_Nearby_Dialog) {

    private val root: View = LayoutInflater.from(context).inflate(R.layout.dialog_edit_review, null, false)
    private val tvPlaceName: TextView = root.findViewById(R.id.tvEditPlaceName)
    private val etTitle: EditText = root.findViewById(R.id.etEditTitle)
    private val etComment: EditText = root.findViewById(R.id.etEditComment)
    private val btnClose: ImageView = root.findViewById(R.id.btnCloseEdit)
    private val btnCancel: TextView = root.findViewById(R.id.btnCancelEdit)
    private val btnSave: TextView = root.findViewById(R.id.btnSaveEdit)

    private val stars = listOf<ImageView>(
        root.findViewById(R.id.starSelect1),
        root.findViewById(R.id.starSelect2),
        root.findViewById(R.id.starSelect3),
        root.findViewById(R.id.starSelect4),
        root.findViewById(R.id.starSelect5)
    )

    private var currentRating: Int = review.rating

    init {
        setContentView(root)
        setupWindow()

        tvPlaceName.text = review.placeName
        etTitle.setText(review.title)
        etComment.setText(review.comment)

        updateStarDisplay(currentRating)

        stars.forEachIndexed { index, star ->
            star.setOnClickListener {
                currentRating = index + 1
                updateStarDisplay(currentRating)
            }
        }

        btnClose.setOnClickListener { dismissWithAnimation() }
        btnCancel.setOnClickListener { dismissWithAnimation() }

        btnSave.setOnClickListener {
            val commentText = etComment.text?.toString()?.trim() ?: ""
            if (commentText.isEmpty()) {
                etComment.error = "Comment cannot be empty"
                return@setOnClickListener
            }
            val titleText = etTitle.text?.toString()?.trim()
            onSave(currentRating.toFloat(), titleText, commentText)
            dismissWithAnimation()
        }
    }

    private fun updateStarDisplay(rating: Int) {
        val activeColor = ContextCompat.getColor(context, R.color.amber_400)
        val inactiveColor = ContextCompat.getColor(context, R.color.card_border)

        stars.forEachIndexed { idx, star ->
            if (idx < rating) {
                star.setColorFilter(activeColor)
            } else {
                star.setColorFilter(inactiveColor)
            }
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

            root.translationY = 600f
            root.animate()
                .translationY(0f)
                .setDuration(240)
                .setInterpolator(DecelerateInterpolator())
                .start()
        } catch (e: Exception) {
            Log.e("EditReviewDialog", "Error showing edit dialog: ${e.message}", e)
        }
    }

    private fun dismissWithAnimation() {
        try {
            if (!isShowing) return
            root.animate()
                .translationY(root.height.toFloat().coerceAtLeast(500f))
                .setDuration(200)
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
