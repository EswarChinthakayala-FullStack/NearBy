package com.example.nearby.designsystem

import android.content.Context
import android.util.AttributeSet
import android.widget.FrameLayout
import android.view.LayoutInflater
import com.example.nearby.databinding.ViewPremiumToolbarViewBinding
import com.example.nearby.utils.WindowInsetsHelper

class PremiumToolbarView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewPremiumToolbarViewBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    init {
        WindowInsetsHelper.applyStatusBarTopPadding(this)
    }

    fun setGreeting(userName: String) {
        val greeting = if (userName.isNotEmpty()) "Hello, $userName 👋" else "Welcome Back 👋"
        binding.tvGreeting.text = greeting
        val initial = if (userName.isNotEmpty()) userName.take(1).uppercase() else "E"
        binding.tvAvatarInitial.text = initial
    }

    fun setLocation(locationText: String) {
        binding.tvCurrentLocation.text = locationText
    }

    fun setOnSearchClickListener(listener: OnClickListener) {
        binding.btnSearchShortcut.setOnClickListener(listener)
    }

    fun setOnNotificationClickListener(listener: OnClickListener) {
        binding.btnNotification.setOnClickListener(listener)
    }

    fun setOnProfileClickListener(listener: OnClickListener) {
        binding.cardUserAvatar.setOnClickListener(listener)
    }
}
