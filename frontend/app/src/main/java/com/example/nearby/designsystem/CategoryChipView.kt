package com.example.nearby.designsystem

import android.content.Context
import android.util.AttributeSet
import android.view.Gravity
import android.view.LayoutInflater
import android.widget.FrameLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.example.nearby.R
import com.example.nearby.databinding.ViewCategoryChipBinding

class CategoryChipView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewCategoryChipBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    private var isChipSelected: Boolean = false

    init {
        isClickable = true
        isFocusable = true
        updateVisualState()
    }

    fun setCategoryName(name: String) {
        binding.tvCategoryName.text = name
    }

    fun setCategoryIcon(iconRes: Int?) {
        if (iconRes != null && iconRes != 0) {
            binding.ivCategoryIcon.setImageResource(iconRes)
            binding.ivCategoryIcon.visibility = VISIBLE
        } else {
            binding.ivCategoryIcon.visibility = GONE
        }
    }

    fun setChipSelected(selected: Boolean) {
        if (isChipSelected != selected) {
            isChipSelected = selected
            updateVisualState()
            animateScale()
        }
    }

    private fun updateVisualState() {
        if (isChipSelected) {
            binding.chipContainer.setBackgroundResource(R.drawable.bg_category_chip_selected)
            binding.tvCategoryName.setTextColor(ContextCompat.getColor(context, R.color.emerald_400))
            binding.ivCategoryIcon.imageTintList = ContextCompat.getColorStateList(context, R.color.emerald_400)
        } else {
            binding.chipContainer.setBackgroundResource(R.drawable.bg_category_chip_normal)
            binding.tvCategoryName.setTextColor(ContextCompat.getColor(context, R.color.text_primary))
            binding.ivCategoryIcon.imageTintList = ContextCompat.getColorStateList(context, R.color.text_secondary)
        }
    }

    private fun animateScale() {
        animate()
            .scaleX(1.05f)
            .scaleY(1.05f)
            .setDuration(120)
            .withEndAction {
                animate()
                    .scaleX(1.0f)
                    .scaleY(1.0f)
                    .setDuration(120)
                    .start()
            }
            .start()
    }
}
