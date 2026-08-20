package com.example.nearby.presentation.favorites.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.example.nearby.databinding.ItemCategoryBinding

class FavoriteCategoryAdapter(
    private val onCategoryClick: (String) -> Unit
) : RecyclerView.Adapter<FavoriteCategoryAdapter.CategoryViewHolder>() {

    private var categories: List<String> = emptyList()
    private var selectedCategory: String = "All"

    fun submitCategories(list: List<String>, selected: String) {
        this.categories = list
        this.selectedCategory = selected
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategoryViewHolder {
        val binding = ItemCategoryBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return CategoryViewHolder(binding)
    }

    override fun onBindViewHolder(holder: CategoryViewHolder, position: Int) {
        holder.bind(categories[position])
    }

    override fun getItemCount(): Int = categories.size

    inner class CategoryViewHolder(private val binding: ItemCategoryBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(category: String) {
            binding.tvCategoryName.text = category
            val isSelected = category.equals(selectedCategory, ignoreCase = true)
            val context = binding.root.context

            if (isSelected) {
                binding.root.setBackgroundResource(R.drawable.bg_button_primary)
                binding.tvCategoryName.setTextColor(ContextCompat.getColor(context, R.color.white))
            } else {
                binding.root.setBackgroundResource(R.drawable.bg_glass_panel)
                binding.tvCategoryName.setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
            }

            binding.root.setOnClickListener {
                onCategoryClick(category)
            }
        }
    }
}
