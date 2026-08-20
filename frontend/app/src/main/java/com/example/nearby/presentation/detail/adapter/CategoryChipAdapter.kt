package com.example.nearby.presentation.detail.adapter

import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.designsystem.CategoryChipView

data class CategoryChipItem(
    val id: String,
    val name: String,
    val iconRes: Int? = null,
    val isSelected: Boolean = false
)

class CategoryChipAdapter(
    private val onCategoryClick: (CategoryChipItem) -> Unit
) : ListAdapter<CategoryChipItem, CategoryChipAdapter.ChipViewHolder>(ChipDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChipViewHolder {
        val chipView = CategoryChipView(parent.context).apply {
            layoutParams = ViewGroup.MarginLayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                marginEnd = (8 * parent.context.resources.displayMetrics.density).toInt()
            }
        }
        return ChipViewHolder(chipView)
    }

    override fun onBindViewHolder(holder: ChipViewHolder, position: Int) {
        val item = getItem(position)
        holder.bind(item)
    }

    inner class ChipViewHolder(val chipView: CategoryChipView) : RecyclerView.ViewHolder(chipView) {
        fun bind(item: CategoryChipItem) {
            chipView.setCategoryName(item.name)
            chipView.setCategoryIcon(item.iconRes)
            chipView.setChipSelected(item.isSelected)

            chipView.setOnClickListener {
                onCategoryClick(item)
            }
        }
    }

    class ChipDiffCallback : DiffUtil.ItemCallback<CategoryChipItem>() {
        override fun areItemsTheSame(oldItem: CategoryChipItem, newItem: CategoryChipItem): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: CategoryChipItem, newItem: CategoryChipItem): Boolean =
            oldItem == newItem
    }
}
