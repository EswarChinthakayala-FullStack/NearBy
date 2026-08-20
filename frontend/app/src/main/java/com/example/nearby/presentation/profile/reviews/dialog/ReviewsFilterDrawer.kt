package com.example.nearby.presentation.profile.reviews.dialog

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.TextView
import androidx.appcompat.widget.SwitchCompat
import com.example.nearby.R
import com.example.nearby.designsystem.CustomBottomDrawer
import com.example.nearby.presentation.profile.reviews.ReviewsFilterState

class ReviewsFilterDrawer(
    private val context: Context,
    private val layoutInflater: LayoutInflater,
    private val onApply: (ReviewsFilterState) -> Unit,
    private val onReset: () -> Unit
) {

    fun open(currentState: ReviewsFilterState) {
        try {
            val drawer = CustomBottomDrawer(context)
            val view = layoutInflater.inflate(R.layout.dialog_reviews_filter, null, false)
            drawer.setTitle("Filter & Sort Reviews")
            drawer.setCustomContentView(view)

            val rgSortBy = view.findViewById<RadioGroup>(R.id.rgReviewSortBy)
            val switchWithPhotos = view.findViewById<SwitchCompat>(R.id.switchWithPhotos)
            val btnApply = view.findViewById<TextView>(R.id.btnApplyReviewFilters)
            val btnReset = view.findViewById<TextView>(R.id.btnResetReviewFilters)

            // Pre-fill state
            switchWithPhotos?.isChecked = currentState.withPhotosOnly
            when (currentState.sortBy) {
                "Oldest" -> view.findViewById<RadioButton>(R.id.rbSortOldest)?.isChecked = true
                "Highest Rating" -> view.findViewById<RadioButton>(R.id.rbSortHighestRating)?.isChecked = true
                "Lowest Rating" -> view.findViewById<RadioButton>(R.id.rbSortLowestRating)?.isChecked = true
                else -> view.findViewById<RadioButton>(R.id.rbSortNewest)?.isChecked = true
            }

            btnApply?.setOnClickListener {
                val sortBy = when (rgSortBy?.checkedRadioButtonId) {
                    R.id.rbSortOldest -> "Oldest"
                    R.id.rbSortHighestRating -> "Highest Rating"
                    R.id.rbSortLowestRating -> "Lowest Rating"
                    else -> "Newest"
                }

                val newState = currentState.copy(
                    sortBy = sortBy,
                    withPhotosOnly = switchWithPhotos?.isChecked ?: false
                )
                onApply(newState)
                drawer.dismissWithAnimation()
            }

            btnReset?.setOnClickListener {
                view.findViewById<RadioButton>(R.id.rbSortNewest)?.isChecked = true
                switchWithPhotos?.isChecked = false
                onReset()
                drawer.dismissWithAnimation()
            }

            drawer.show()
        } catch (e: Exception) {
            Log.e("ReviewsFilterDrawer", "Error opening reviews filter drawer: ${e.message}", e)
        }
    }
}
