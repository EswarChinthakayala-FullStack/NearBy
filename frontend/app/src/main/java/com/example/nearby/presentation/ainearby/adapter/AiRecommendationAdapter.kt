package com.example.nearby.presentation.ainearby.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.databinding.ItemAiPlaceBinding
import com.tourismguide.app.data.remote.dto.AINearbyRecommendationDto

class AiRecommendationAdapter(
    private val onItemClick: (AINearbyRecommendationDto) -> Unit,
    private val onFavoriteToggle: (AINearbyRecommendationDto) -> Unit,
    private val onNavigateClick: (AINearbyRecommendationDto) -> Unit,
    private val onShareClick: (AINearbyRecommendationDto) -> Unit
) : ListAdapter<AINearbyRecommendationDto, AiRecommendationAdapter.RecommendationViewHolder>(RecommendationDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecommendationViewHolder {
        val binding = ItemAiPlaceBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RecommendationViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RecommendationViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class RecommendationViewHolder(private val binding: ItemAiPlaceBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: AINearbyRecommendationDto) {
            val name = if (item.placeName.isEmpty()) "Destination" else item.placeName
            binding.tvPlaceName.text = name
            binding.tvCategory.text = "#${item.category.uppercase()}"
            binding.tvDistance.text = "${String.format(java.util.Locale.US, "%.1f", item.distanceKm)} km away"
            binding.tvRating.text = "★ ${String.format(java.util.Locale.US, "%.1f", item.rating)}"
            binding.tvReason.text = item.reason

            val coverUrl = if (!item.coverImage.isNullOrEmpty() && item.coverImage.startsWith("http")) {
                item.coverImage
            } else {
                com.example.nearby.utils.DestinationImageHelper.getImageUrlForDestination(name)
            }
            binding.ivCover.load(coverUrl)

            binding.root.setOnClickListener { onItemClick(item) }
            binding.btnViewDetails.setOnClickListener { onItemClick(item) }
            binding.btnFavoriteToggle.setOnClickListener { onFavoriteToggle(item) }
            binding.btnNavigate.setOnClickListener { onNavigateClick(item) }
            binding.btnShare.setOnClickListener { onShareClick(item) }
        }
    }

    class RecommendationDiffCallback : DiffUtil.ItemCallback<AINearbyRecommendationDto>() {
        override fun areItemsTheSame(oldItem: AINearbyRecommendationDto, newItem: AINearbyRecommendationDto): Boolean {
            return oldItem.placeUuid == newItem.placeUuid || oldItem.placeSlug == newItem.placeSlug
        }

        override fun areContentsTheSame(oldItem: AINearbyRecommendationDto, newItem: AINearbyRecommendationDto): Boolean {
            return oldItem == newItem
        }
    }
}
