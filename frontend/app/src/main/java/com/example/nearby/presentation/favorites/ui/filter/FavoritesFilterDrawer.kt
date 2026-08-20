package com.example.nearby.presentation.favorites.ui.filter

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.TextView
import androidx.appcompat.widget.SwitchCompat
import com.example.nearby.R
import com.example.nearby.designsystem.CustomBottomDrawer
import com.example.nearby.presentation.favorites.FavoritesFilterState

class FavoritesFilterDrawer(
    private val context: Context,
    private val layoutInflater: LayoutInflater,
    private val onApply: (FavoritesFilterState) -> Unit,
    private val onReset: () -> Unit
) {

    fun open() {
        try {
            val drawer = CustomBottomDrawer(context)
            val view = layoutInflater.inflate(R.layout.layout_filter_drawer, null, false)
            drawer.setTitle("Filter & Sort Saved Places")
            drawer.setCustomContentView(view)

            val rgSortBy = view.findViewById<RadioGroup>(R.id.rgSortBy)
            val rgRating = view.findViewById<RadioGroup>(R.id.rgRating)
            val switchOpenNow = view.findViewById<SwitchCompat>(R.id.switchOpenNow)
            val btnApply = view.findViewById<TextView>(R.id.btnApplyFilters)
            val btnReset = view.findViewById<TextView>(R.id.btnResetFilters)

            btnApply?.setOnClickListener {
                val sortBy = when (rgSortBy?.checkedRadioButtonId) {
                    R.id.rbSortAlphabetical -> "Alphabetical"
                    R.id.rbSortRating -> "Rating"
                    else -> "Recently Saved"
                }

                val minRating = when (rgRating?.checkedRadioButtonId) {
                    R.id.rbRating4Plus -> 4.0f
                    R.id.rbRating45Plus -> 4.5f
                    else -> 0.0f
                }

                val state = FavoritesFilterState(
                    sortBy = sortBy,
                    minRating = minRating,
                    openNowOnly = switchOpenNow?.isChecked ?: false
                )
                onApply(state)
                drawer.dismissWithAnimation()
            }

            btnReset?.setOnClickListener {
                view.findViewById<RadioButton>(R.id.rbSortRecentlySaved)?.isChecked = true
                view.findViewById<RadioButton>(R.id.rbRatingAny)?.isChecked = true
                switchOpenNow?.isChecked = false
                onReset()
                drawer.dismissWithAnimation()
            }

            drawer.show()
        } catch (e: Exception) {
            Log.e("FavoritesFilterDrawer", "Error opening saved places filter drawer: ${e.message}", e)
        }
    }

    fun close() {}
}
