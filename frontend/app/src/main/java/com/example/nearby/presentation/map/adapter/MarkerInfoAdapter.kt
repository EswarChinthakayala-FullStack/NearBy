package com.example.nearby.presentation.map.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.databinding.ItemNearbyPlaceCardBinding
import com.example.nearby.presentation.home.PlaceItem

class MarkerInfoAdapter(
    private val place: PlaceItem,
    private val onClick: () -> Unit
) : RecyclerView.Adapter<MarkerInfoAdapter.MarkerViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MarkerViewHolder {
        val binding = ItemNearbyPlaceCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return MarkerViewHolder(binding)
    }

    override fun onBindViewHolder(holder: MarkerViewHolder, position: Int) {
        holder.bind(place)
    }

    override fun getItemCount(): Int = 1

    inner class MarkerViewHolder(private val binding: ItemNearbyPlaceCardBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: PlaceItem) {
            binding.tvNearbyTitle.text = item.name
            binding.tvNearbyDistance.text = item.distance
            binding.tvNearbyRating.text = "★ ${item.rating}"
            binding.root.setOnClickListener { onClick() }
        }
    }
}
