package com.example.nearby.presentation.favorites.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.R
import com.example.nearby.databinding.ItemFavoritePlaceBinding
import com.tourismguide.app.data.remote.dto.FavoriteDto

class FavoritePlaceAdapter(
    private val onItemClick: (FavoriteDto) -> Unit,
    private val onFavoriteToggle: (FavoriteDto) -> Unit,
    private val onNavigateClick: (FavoriteDto) -> Unit,
    private val onShareClick: (FavoriteDto) -> Unit
) : ListAdapter<FavoriteDto, FavoritePlaceAdapter.FavoriteViewHolder>(FavoriteDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FavoriteViewHolder {
        val binding = ItemFavoritePlaceBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return FavoriteViewHolder(binding)
    }

    override fun onBindViewHolder(holder: FavoriteViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class FavoriteViewHolder(private val binding: ItemFavoritePlaceBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: FavoriteDto) {
            val place = item.place
            val name = item.placeName.ifEmpty { "Saved Destination" }
            val category = item.placeCategory.ifEmpty { "HISTORICAL" }
            val city = place?.city ?: "Delhi"
            val rating = place?.avgRating ?: 4.5
            val reviews = place?.totalReviews ?: 12

            binding.tvPlaceName.text = name
            binding.tvCategoryBadge.text = "#${category.uppercase()}"
            binding.tvLocation.text = "$city, India"
            binding.tvRating.text = "★ ${String.format(java.util.Locale.US, "%.1f", rating)}"
            binding.tvReviewCount.text = "($reviews)"

            val coverUrl = item.imageUrl
            if (coverUrl.isNotEmpty()) {
                binding.ivCover.load(coverUrl)
            } else {
                binding.ivCover.setImageResource(R.drawable.bg_wave_top)
            }

            binding.root.setOnClickListener { onItemClick(item) }
            binding.btnFavoriteToggle.setOnClickListener { onFavoriteToggle(item) }
            binding.btnNavigate.setOnClickListener { onNavigateClick(item) }
            binding.btnShare.setOnClickListener { onShareClick(item) }
        }
    }

    class FavoriteDiffCallback : DiffUtil.ItemCallback<FavoriteDto>() {
        override fun areItemsTheSame(oldItem: FavoriteDto, newItem: FavoriteDto): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: FavoriteDto, newItem: FavoriteDto): Boolean {
            return oldItem == newItem
        }
    }
}
