package com.example.nearby.presentation.map.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.databinding.ItemNearbyPlaceCardBinding
import com.example.nearby.presentation.home.PlaceItem

class NearbyCarouselAdapter(
    private val onPlaceClick: (PlaceItem) -> Unit
) : ListAdapter<PlaceItem, NearbyCarouselAdapter.CarouselViewHolder>(CarouselDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CarouselViewHolder {
        val binding = ItemNearbyPlaceCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return CarouselViewHolder(binding)
    }

    override fun onBindViewHolder(holder: CarouselViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class CarouselViewHolder(private val binding: ItemNearbyPlaceCardBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(place: PlaceItem) {
            binding.tvNearbyTitle.text = place.name
            binding.tvNearbyDistance.text = place.distance
            binding.tvNearbyRating.text = "★ ${place.rating}"
            binding.root.setOnClickListener { onPlaceClick(place) }
        }
    }

    class CarouselDiffCallback : DiffUtil.ItemCallback<PlaceItem>() {
        override fun areItemsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem == newItem
    }
}
