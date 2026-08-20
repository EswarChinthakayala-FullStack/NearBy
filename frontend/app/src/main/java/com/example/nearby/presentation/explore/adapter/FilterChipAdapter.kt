package com.example.nearby.presentation.explore.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.databinding.ItemFilterChipBinding
import com.example.nearby.presentation.explore.FilterChipItem

class FilterChipAdapter(
    private val onRemoveClick: (FilterChipItem) -> Unit
) : ListAdapter<FilterChipItem, FilterChipAdapter.FilterChipViewHolder>(FilterChipDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FilterChipViewHolder {
        val binding = ItemFilterChipBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return FilterChipViewHolder(binding)
    }

    override fun onBindViewHolder(holder: FilterChipViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class FilterChipViewHolder(
        private val binding: ItemFilterChipBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: FilterChipItem) {
            binding.tvFilterLabel.text = item.label
            binding.btnRemoveChip.setOnClickListener {
                onRemoveClick(item)
            }
        }
    }

    class FilterChipDiffCallback : DiffUtil.ItemCallback<FilterChipItem>() {
        override fun areItemsTheSame(oldItem: FilterChipItem, newItem: FilterChipItem): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: FilterChipItem, newItem: FilterChipItem): Boolean {
            return oldItem == newItem
        }
    }
}
