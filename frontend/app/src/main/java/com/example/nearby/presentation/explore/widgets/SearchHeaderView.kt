package com.example.nearby.presentation.explore.widgets

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import com.example.nearby.databinding.ViewFloatingSearchBarBinding

class SearchHeaderView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    val binding: ViewFloatingSearchBarBinding = ViewFloatingSearchBarBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    fun setSearchQuery(query: String) {
        if (binding.etSearchPlaces.text.toString() != query) {
            binding.etSearchPlaces.setText(query)
        }
    }

    fun setOnFilterClickListener(listener: OnClickListener) {
        binding.btnHamburgerContainer.setOnClickListener(listener)
    }

    fun setOnVoiceClickListener(listener: OnClickListener) {
        binding.btnVoiceContainer.setOnClickListener(listener)
    }
}
