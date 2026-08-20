package com.example.nearby.presentation.detail.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.databinding.ItemNearbyPlaceCardBinding
import com.example.nearby.presentation.home.PlaceItem

class NearbyPlaceAdapter(
    private val onPlaceClick: (PlaceItem) -> Unit,
    private val onFavoriteClick: (PlaceItem) -> Unit
) : ListAdapter<PlaceItem, NearbyPlaceAdapter.NearbyViewHolder>(NearbyDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NearbyViewHolder {
        val binding = ItemNearbyPlaceCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return NearbyViewHolder(binding)
    }

    override fun onBindViewHolder(holder: NearbyViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class NearbyViewHolder(
        private val binding: ItemNearbyPlaceCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(place: PlaceItem) {
            binding.tvNearbyTitle.text = place.name
            binding.tvNearbyDistance.text = place.distance
            binding.tvNearbyRating.text = "★ ${place.rating}"
            binding.root.setOnClickListener { onPlaceClick(place) }
        }
    }

    class NearbyDiffCallback : DiffUtil.ItemCallback<PlaceItem>() {
        override fun areItemsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem == newItem
    }
}
