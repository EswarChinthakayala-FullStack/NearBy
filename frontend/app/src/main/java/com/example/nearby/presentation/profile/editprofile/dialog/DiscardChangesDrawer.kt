package com.example.nearby.presentation.profile.editprofile.dialog

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.widget.TextView
import com.example.nearby.R
import com.example.nearby.designsystem.CustomBottomDrawer

class DiscardChangesDrawer(
    private val context: Context,
    private val layoutInflater: LayoutInflater,
    private val onDiscard: () -> Unit
) {

    fun show() {
        try {
            val drawer = CustomBottomDrawer(context)
            val view = layoutInflater.inflate(R.layout.dialog_discard_changes, null, false)
            drawer.setCustomContentView(view)

            val btnContinue = view.findViewById<TextView>(R.id.btnContinueEditing)
            val btnDiscard = view.findViewById<TextView>(R.id.btnDiscardChanges)

            btnContinue?.setOnClickListener {
                drawer.dismissWithAnimation()
            }

            btnDiscard?.setOnClickListener {
                onDiscard()
                drawer.dismissWithAnimation()
            }

            drawer.show()
        } catch (e: Exception) {
            Log.e("DiscardChangesDrawer", "Error showing discard changes drawer: ${e.message}", e)
        }
    }
}
