package com.example.nearby.designsystem

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.view.LayoutInflater
import android.view.Window
import android.widget.Button
import android.widget.TextView
import com.example.nearby.R

class EmeraldDialog(context: Context) {

    private val dialog = Dialog(context)
    private val dialogView = LayoutInflater.from(context).inflate(R.layout.view_error_state, null)

    init {
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(dialogView)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
    }

    fun setTitle(title: String): EmeraldDialog {
        dialogView.findViewById<TextView>(R.id.error_title)?.text = title
        return this
    }

    fun setMessage(message: String): EmeraldDialog {
        dialogView.findViewById<TextView>(R.id.error_message)?.text = message
        return this
    }

    fun setPositiveButton(text: String, onClick: () -> Unit): EmeraldDialog {
        val btn = dialogView.findViewById<Button>(R.id.btn_retry)
        btn?.text = text
        btn?.setOnClickListener {
            onClick()
            dialog.dismiss()
        }
        return this
    }

    fun show() {
        dialog.show()
    }

    fun dismiss() {
        dialog.dismiss()
    }
}
