package com.example.nearby.presentation.favorites.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.paging.PagingDataAdapter
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.databinding.ItemFavoriteCardBinding
import com.example.nearby.presentation.home.PlaceItem

class FavoritesPagingAdapter(
    private val onPlaceClick: (PlaceItem) -> Unit,
    private val onRemoveClick: (PlaceItem) -> Unit
) : PagingDataAdapter<PlaceItem, FavoritesPagingAdapter.FavoritesViewHolder>(FavoritesDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FavoritesViewHolder {
        val binding = ItemFavoriteCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return FavoritesViewHolder(binding)
    }

    override fun onBindViewHolder(holder: FavoritesViewHolder, position: Int) {
        val item = getItem(position)
        if (item != null) {
            holder.bind(item)
        }
    }

    inner class FavoritesViewHolder(private val binding: ItemFavoriteCardBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(place: PlaceItem) {
            binding.tvFavTitle.text = place.name
            binding.tvFavCategory.text = "${place.category} • ${place.distance}"
            binding.tvFavRating.text = "★ ${place.rating}"
            binding.root.setOnClickListener { onPlaceClick(place) }
            binding.btnRemoveFav.setOnClickListener { onRemoveClick(place) }
        }
    }

    class FavoritesDiffCallback : DiffUtil.ItemCallback<PlaceItem>() {
        override fun areItemsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem == newItem
    }
}
