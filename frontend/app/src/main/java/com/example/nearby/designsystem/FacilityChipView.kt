package com.example.nearby.designsystem

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import com.example.nearby.R
import com.example.nearby.databinding.ViewFacilityChipBinding

class FacilityChipView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewFacilityChipBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    init {
        isClickable = true
        isFocusable = true
    }

    fun setFacilityName(name: String) {
        binding.tvFacilityName.text = name
    }

    fun setFacilityIcon(iconRes: Int?) {
        if (iconRes != null && iconRes != 0) {
            binding.ivFacilityIcon.setImageResource(iconRes)
        } else {
            binding.ivFacilityIcon.setImageResource(R.drawable.ic_check)
        }
    }
}
