package com.example.nearby.presentation.profile.mytrips.dialog

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.TextView
import com.example.nearby.R
import com.example.nearby.designsystem.CustomBottomDrawer
import com.example.nearby.presentation.profile.mytrips.MyTripsFilterState

class MyTripsFilterDrawer(
    private val context: Context,
    private val layoutInflater: LayoutInflater,
    private val onApply: (MyTripsFilterState) -> Unit,
    private val onReset: () -> Unit
) {

    fun open(currentState: MyTripsFilterState) {
        try {
            val drawer = CustomBottomDrawer(context)
            val view = layoutInflater.inflate(R.layout.dialog_my_trips_filter, null, false)
            drawer.setTitle("Filter & Sort Itineraries")
            drawer.setCustomContentView(view)

            val rgSortBy = view.findViewById<RadioGroup>(R.id.rgTripSortBy)
            val rgStatus = view.findViewById<RadioGroup>(R.id.rgTripStatus)
            val btnApply = view.findViewById<TextView>(R.id.btnApplyTripFilters)
            val btnReset = view.findViewById<TextView>(R.id.btnResetTripFilters)

            // Pre-fill selection
            when (currentState.sortBy) {
                "Oldest" -> view.findViewById<RadioButton>(R.id.rbSortOldest)?.isChecked = true
                "Most Places" -> view.findViewById<RadioButton>(R.id.rbSortMostPlaces)?.isChecked = true
                "Longest Duration" -> view.findViewById<RadioButton>(R.id.rbSortLongest)?.isChecked = true
                else -> view.findViewById<RadioButton>(R.id.rbSortNewest)?.isChecked = true
            }

            when (currentState.statusFilter) {
                "Completed" -> view.findViewById<RadioButton>(R.id.rbStatusCompleted)?.isChecked = true
                "Planning" -> view.findViewById<RadioButton>(R.id.rbStatusPlanning)?.isChecked = true
                else -> view.findViewById<RadioButton>(R.id.rbStatusAll)?.isChecked = true
            }

            btnApply?.setOnClickListener {
                val sortBy = when (rgSortBy?.checkedRadioButtonId) {
                    R.id.rbSortOldest -> "Oldest"
                    R.id.rbSortMostPlaces -> "Most Places"
                    R.id.rbSortLongest -> "Longest Duration"
                    else -> "Newest"
                }

                val statusFilter = when (rgStatus?.checkedRadioButtonId) {
                    R.id.rbStatusCompleted -> "Completed"
                    R.id.rbStatusPlanning -> "Planning"
                    else -> "All"
                }

                val newState = currentState.copy(
                    sortBy = sortBy,
                    statusFilter = statusFilter
                )
                onApply(newState)
                drawer.dismissWithAnimation()
            }

            btnReset?.setOnClickListener {
                view.findViewById<RadioButton>(R.id.rbSortNewest)?.isChecked = true
                view.findViewById<RadioButton>(R.id.rbStatusAll)?.isChecked = true
                onReset()
                drawer.dismissWithAnimation()
            }

            drawer.show()
        } catch (e: Exception) {
            Log.e("MyTripsFilterDrawer", "Error opening trip filter drawer: ${e.message}", e)
        }
    }
}
