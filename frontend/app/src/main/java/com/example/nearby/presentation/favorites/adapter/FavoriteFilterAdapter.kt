package com.example.nearby.presentation.favorites.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.databinding.ItemCategoryBinding

class FavoriteFilterAdapter(
    private val onFilterSelect: (String) -> Unit
) : RecyclerView.Adapter<FavoriteFilterAdapter.FilterViewHolder>() {

    private var filters: List<String> = emptyList()

    fun submitList(list: List<String>) {
        this.filters = list
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FilterViewHolder {
        val binding = ItemCategoryBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return FilterViewHolder(binding)
    }

    override fun onBindViewHolder(holder: FilterViewHolder, position: Int) {
        holder.bind(filters[position])
    }

    override fun getItemCount(): Int = filters.size

    inner class FilterViewHolder(private val binding: ItemCategoryBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(filter: String) {
            binding.tvCategoryName.text = filter
            binding.root.setOnClickListener { onFilterSelect(filter) }
        }
    }
}
