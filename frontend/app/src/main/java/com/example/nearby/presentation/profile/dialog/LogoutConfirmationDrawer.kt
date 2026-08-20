package com.example.nearby.presentation.profile.dialog

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import com.example.nearby.databinding.DialogLogoutConfirmationBinding
import com.example.nearby.designsystem.CustomBottomDrawer

class LogoutConfirmationDrawer(
    private val context: Context,
    private val layoutInflater: LayoutInflater,
    private val onLogoutConfirmed: () -> Unit
) {

    fun show() {
        try {
            val drawer = CustomBottomDrawer(context)
            val binding = DialogLogoutConfirmationBinding.inflate(layoutInflater)
            drawer.setTitle("Log Out Confirmation")
            drawer.setCustomContentView(binding.root)

            binding.btnCancelLogout.setOnClickListener {
                drawer.dismissWithAnimation()
            }

            binding.btnConfirmLogout.setOnClickListener {
                drawer.dismissWithAnimation()
                onLogoutConfirmed()
            }

            drawer.show()
        } catch (e: Exception) {
            Log.e("LogoutDrawer", "Error displaying logout confirmation drawer: ${e.message}", e)
        }
    }
}
