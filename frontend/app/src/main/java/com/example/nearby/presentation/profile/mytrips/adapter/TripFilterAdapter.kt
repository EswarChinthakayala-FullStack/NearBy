package com.example.nearby.presentation.profile.mytrips.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.example.nearby.databinding.ItemTripFilterChipBinding

class TripFilterAdapter(
    private val onCategorySelected: (String) -> Unit
) : RecyclerView.Adapter<TripFilterAdapter.ViewHolder>() {

    private var categories: List<String> = emptyList()
    private var selectedCategory: String = "All"

    fun submitCategories(newList: List<String>, selected: String) {
        categories = newList
        selectedCategory = selected
        notifyDataSetChanged()
    }

    inner class ViewHolder(val binding: ItemTripFilterChipBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemTripFilterChipBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val category = categories[position]
        val isSelected = category.equals(selectedCategory, ignoreCase = true)
        val context = holder.itemView.context

        holder.binding.tvTripFilterChip.text = category

        if (isSelected) {
            holder.binding.tvTripFilterChip.setBackgroundResource(R.drawable.bg_emerald_badge)
            holder.binding.tvTripFilterChip.setTextColor(ContextCompat.getColor(context, R.color.emerald_400))
        } else {
            holder.binding.tvTripFilterChip.setBackgroundResource(R.drawable.bg_glass_panel)
            holder.binding.tvTripFilterChip.setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
        }

        holder.itemView.setOnClickListener {
            if (!isSelected) {
                selectedCategory = category
                notifyDataSetChanged()
                onCategorySelected(category)
            }
        }
    }

    override fun getItemCount(): Int = categories.size
}
