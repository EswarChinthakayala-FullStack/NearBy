package com.example.nearby.presentation.detail.adapter

import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.designsystem.FacilityChipView
import com.example.nearby.presentation.detail.FacilityItem

class FacilityAdapter : ListAdapter<FacilityItem, FacilityAdapter.FacilityViewHolder>(FacilityDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FacilityViewHolder {
        val chipView = FacilityChipView(parent.context).apply {
            layoutParams = ViewGroup.MarginLayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                marginEnd = (8 * parent.context.resources.displayMetrics.density).toInt()
            }
        }
        return FacilityViewHolder(chipView)
    }

    override fun onBindViewHolder(holder: FacilityViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class FacilityViewHolder(
        val chipView: FacilityChipView
    ) : RecyclerView.ViewHolder(chipView) {

        fun bind(item: FacilityItem) {
            chipView.setFacilityName(item.name)
            chipView.setFacilityIcon(item.iconRes)
        }
    }

    class FacilityDiffCallback : DiffUtil.ItemCallback<FacilityItem>() {
        override fun areItemsTheSame(oldItem: FacilityItem, newItem: FacilityItem): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: FacilityItem, newItem: FacilityItem): Boolean = oldItem == newItem
    }
}
