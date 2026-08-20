package com.example.nearby.designsystem

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import com.example.nearby.R
import com.example.nearby.databinding.ItemCategoryBinding

class PremiumFilterChip @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ItemCategoryBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    private var isChipSelected: Boolean = false

    fun setLabel(label: String) {
        binding.tvCategoryName.text = label
    }

    fun setChipSelected(selected: Boolean) {
        isChipSelected = selected
        if (selected) {
            binding.root.setBackgroundResource(R.drawable.bg_button_primary)
            binding.tvCategoryName.setTextColor(ContextCompat.getColor(context, R.color.white))
        } else {
            binding.root.setBackgroundResource(R.drawable.bg_glass_panel)
            binding.tvCategoryName.setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
        }
    }

    fun isSelectedChip(): Boolean = isChipSelected
}
