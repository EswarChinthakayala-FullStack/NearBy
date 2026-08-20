package com.example.nearby.presentation.favorites.dialog

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.WindowManager
import android.widget.Button
import com.example.nearby.R

class ClearFavoritesDialog(
    context: Context,
    private val onConfirmClear: () -> Unit
) : Dialog(context, R.style.Theme_Nearby_Dialog) {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val view = LayoutInflater.from(context).inflate(R.layout.dialog_logout, null)
        setContentView(view)

        window?.let { win ->
            win.setLayout(
                (context.resources.displayMetrics.widthPixels * 0.85).toInt(),
                WindowManager.LayoutParams.WRAP_CONTENT
            )
            win.setBackgroundDrawableResource(android.R.color.transparent)
            win.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
            win.setDimAmount(0.65f)
        }

        view.findViewById<Button>(R.id.btn_confirm_logout)?.apply {
            text = "Clear All"
            setOnClickListener {
                onConfirmClear()
                dismiss()
            }
        }
        view.findViewById<Button>(R.id.btn_cancel_logout)?.setOnClickListener { dismiss() }
    }
}
