package com.example.nearby.presentation.explore.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.paging.PagingDataAdapter
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.example.nearby.databinding.ItemPlaceCardBinding
import com.example.nearby.presentation.home.PlaceItem

class PlacePagingAdapter(
    private val onPlaceClick: (PlaceItem) -> Unit,
    private val onBookmarkClick: (PlaceItem) -> Unit
) : PagingDataAdapter<PlaceItem, PlacePagingAdapter.PlaceViewHolder>(PlaceDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PlaceViewHolder {
        val binding = ItemPlaceCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return PlaceViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PlaceViewHolder, position: Int) {
        getItem(position)?.let { holder.bind(it) }
    }

    inner class PlaceViewHolder(
        private val binding: ItemPlaceCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(place: PlaceItem) {
            binding.tvPlaceName.text = place.name
            binding.tvPlaceRating.text = place.rating
            binding.tvPlaceDistance.text = place.distance
            binding.tvPlaceStatus.text = place.openStatus

            val bookmarkIcon = if (place.isFavorite) R.drawable.ic_heart_filled else R.drawable.ic_heart
            binding.btnFavorite.setImageResource(bookmarkIcon)

            binding.btnFavorite.setOnClickListener {
                onBookmarkClick(place)
            }

            binding.root.setOnClickListener {
                onPlaceClick(place)
            }
        }
    }

    class PlaceDiffCallback : DiffUtil.ItemCallback<PlaceItem>() {
        override fun areItemsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean {
            return oldItem == newItem
        }
    }
}
