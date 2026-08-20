package com.example.nearby.presentation.navigation.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.databinding.ItemRouteStepBinding
import com.example.nearby.presentation.navigation.RouteStepItem

class RouteStepAdapter : ListAdapter<RouteStepItem, RouteStepAdapter.RouteStepViewHolder>(StepDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RouteStepViewHolder {
        val binding = ItemRouteStepBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RouteStepViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RouteStepViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class RouteStepViewHolder(private val binding: ItemRouteStepBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: RouteStepItem) {
            binding.tvStepInstruction.text = item.instruction
            binding.tvStepDistance.text = "${item.distanceText} • ${item.durationText}"
            binding.ivStepIcon.setImageResource(item.iconRes)
        }
    }

    class StepDiffCallback : DiffUtil.ItemCallback<RouteStepItem>() {
        override fun areItemsTheSame(oldItem: RouteStepItem, newItem: RouteStepItem): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: RouteStepItem, newItem: RouteStepItem): Boolean = oldItem == newItem
    }
}
