package com.example.nearby.presentation.navigation.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.databinding.ItemNearbyPlaceCardBinding
import com.example.nearby.presentation.home.PlaceItem

class NearbyPlaceAdapter(
    private val onPlaceClick: (PlaceItem) -> Unit
) : ListAdapter<PlaceItem, NearbyPlaceAdapter.NearbyPlaceViewHolder>(NearbyDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NearbyPlaceViewHolder {
        val binding = ItemNearbyPlaceCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return NearbyPlaceViewHolder(binding)
    }

    override fun onBindViewHolder(holder: NearbyPlaceViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class NearbyPlaceViewHolder(private val binding: ItemNearbyPlaceCardBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: PlaceItem) {
            binding.tvNearbyTitle.text = item.name
            binding.tvNearbyDistance.text = item.distance
            binding.tvNearbyRating.text = "★ ${item.rating}"
            if (item.imageUrl.isNotEmpty()) {
                binding.ivNearbyThumbnail.load(item.imageUrl)
            }
            binding.root.setOnClickListener { onPlaceClick(item) }
        }
    }

    class NearbyDiffCallback : DiffUtil.ItemCallback<PlaceItem>() {
        override fun areItemsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: PlaceItem, newItem: PlaceItem): Boolean = oldItem == newItem
    }
}
