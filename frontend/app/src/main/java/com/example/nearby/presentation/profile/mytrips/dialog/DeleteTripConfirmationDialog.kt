package com.example.nearby.presentation.profile.mytrips.dialog

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.widget.TextView
import com.example.nearby.R
import com.example.nearby.designsystem.CustomBottomDrawer
import com.example.nearby.presentation.profile.mytrips.model.TripDomainModel

class DeleteTripConfirmationDialog(
    private val context: Context,
    private val layoutInflater: LayoutInflater,
    private val onConfirmDelete: (TripDomainModel) -> Unit
) {

    fun show(trip: TripDomainModel) {
        try {
            val drawer = CustomBottomDrawer(context)
            val view = layoutInflater.inflate(R.layout.dialog_delete_trip, null, false)
            drawer.setCustomContentView(view)

            val tvExplanation = view.findViewById<TextView>(R.id.tvDeleteTripExplanation)
            val btnCancel = view.findViewById<TextView>(R.id.btnCancelDeleteTrip)
            val btnConfirm = view.findViewById<TextView>(R.id.btnConfirmDeleteTrip)

            val titleText = trip.title.ifEmpty { "${trip.daysCount}-Day Trip to ${trip.destination}" }
            tvExplanation?.text = "Are you sure you want to delete your trip '$titleText'? This action cannot be undone."

            btnCancel?.setOnClickListener {
                drawer.dismissWithAnimation()
            }

            btnConfirm?.setOnClickListener {
                onConfirmDelete(trip)
                drawer.dismissWithAnimation()
            }

            drawer.show()
        } catch (e: Exception) {
            Log.e("DeleteTripDialog", "Error showing delete trip confirmation dialog: ${e.message}", e)
        }
    }
}
