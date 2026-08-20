package com.example.nearby.presentation.favorites.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.databinding.ItemFacilityBinding

class FavoriteCollectionAdapter(
    private val categories: List<String>,
    private val onCategoryClick: (String) -> Unit
) : RecyclerView.Adapter<FavoriteCollectionAdapter.CollectionViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CollectionViewHolder {
        val binding = ItemFacilityBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return CollectionViewHolder(binding)
    }

    override fun onBindViewHolder(holder: CollectionViewHolder, position: Int) {
        holder.bind(categories[position])
    }

    override fun getItemCount(): Int = categories.size

    inner class CollectionViewHolder(private val binding: ItemFacilityBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(category: String) {
            binding.tvFacilityName.text = category
            binding.root.setOnClickListener { onCategoryClick(category) }
        }
    }
}
