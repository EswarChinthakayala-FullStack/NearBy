package com.example.nearby.presentation.favorites.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.databinding.ItemFavoriteGridBinding
import com.example.nearby.presentation.home.PlaceItem

class FavoritesGridAdapter(
    private val onPlaceClick: (PlaceItem) -> Unit,
    private val onRemoveClick: (PlaceItem) -> Unit
) : ListAdapter<PlaceItem, FavoritesGridAdapter.GridViewHolder>(GridDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GridViewHolder {
        val binding = ItemFavoriteGridBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return GridViewHolder(binding)
    }

    override fun onBindViewHolder(holder: GridViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class GridViewHolder(private val binding: ItemFavoriteGridBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(place: PlaceItem) {
            binding.tvGridTitle.text = place.name
            binding.tvGridRating.text = "★ ${place.rating} • ${place.distance}"
            if (place.imageUrl.isNotEmpty()) {
                binding.ivGridThumbnail.load(place.imageUrl)
            }
            binding.root.setOnClickListener { onPlaceClick(place) }
            binding.btnGridRemove.setOnClickListener { onRemoveClick(place) }
        }
    }

    class GridDiffCallback : DiffUtil.ItemCallback<PlaceItem>() {
        override fun areItemsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem == newItem
    }
}
