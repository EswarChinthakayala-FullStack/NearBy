package com.example.nearby.presentation.profile.reviews.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import coil3.request.crossfade
import com.example.nearby.R
import com.example.nearby.databinding.ItemUserReviewCardBinding
import com.example.nearby.presentation.profile.reviews.model.UserReviewDomainModel

class ReviewAdapter(
    private val onViewPlaceClick: (UserReviewDomainModel) -> Unit,
    private val onEditClick: (UserReviewDomainModel) -> Unit,
    private val onDeleteClick: (UserReviewDomainModel) -> Unit,
    private val onToggleExpand: (UserReviewDomainModel) -> Unit,
    private val onPhotoClick: (List<String>, Int) -> Unit
) : ListAdapter<UserReviewDomainModel, ReviewAdapter.ViewHolder>(DiffCallback) {

    inner class ViewHolder(val binding: ItemUserReviewCardBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemUserReviewCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = getItem(position)
        val binding = holder.binding

        // 1. Place Cover & Info Header
        val coverUrl = item.coverImage ?: ""
        if (coverUrl.isNotBlank()) {
            binding.ivPlaceCover.load(coverUrl) {
                crossfade(true)
            }
        } else {
            binding.ivPlaceCover.setImageResource(R.drawable.bg_grid_pattern)
        }

        binding.tvPlaceName.text = item.placeName ?: "Tourist Attraction"
        binding.tvCategoryBadge.text = (item.placeCategory ?: "").ifEmpty { "Attraction" }
        binding.tvPlaceRating.text = String.format(java.util.Locale.US, "%.1f", item.placeRating)

        val locParts = listOfNotNull(
            item.city?.takeIf { it.isNotBlank() },
            item.state?.takeIf { it.isNotBlank() },
            item.country?.takeIf { it.isNotBlank() }
        )
        binding.tvPlaceLocation.text = if (locParts.isNotEmpty()) locParts.joinToString(", ") else "Explore Destination"

        // 2. Star Rating Display
        renderStarRating(holder, item.rating)

        // 3. Review Title & Comment
        val titleText = item.title ?: ""
        if (titleText.isNotBlank()) {
            binding.tvReviewTitle.visibility = View.VISIBLE
            binding.tvReviewTitle.text = titleText
        } else {
            binding.tvReviewTitle.visibility = View.GONE
        }

        val commentText = item.comment ?: ""
        binding.tvReviewComment.text = commentText

        if (item.isExpanded) {
            binding.tvReviewComment.maxLines = Int.MAX_VALUE
            binding.btnReadMore.text = "Show Less"
            binding.btnReadMore.visibility = View.VISIBLE
        } else {
            binding.tvReviewComment.maxLines = 3
            binding.btnReadMore.text = "Read More"
            binding.btnReadMore.visibility = if (commentText.length > 120) View.VISIBLE else View.GONE
        }

        // 4. Timestamp & Updated Badge
        val timeLabel = formatTimestamp(item.createdAt ?: "", item.updatedAt)
        binding.tvReviewTimestamp.text = timeLabel

        // 5. Helpful Votes Badge
        val totalHelpful = (item.helpfulCount) + (item.likes)
        if (totalHelpful > 0) {
            binding.tvHelpfulCount.visibility = View.VISIBLE
            binding.tvHelpfulCount.text = "$totalHelpful people found this helpful"
        } else {
            binding.tvHelpfulCount.visibility = View.GONE
        }

        // 6. Photo Gallery
        val photoList = item.photos ?: emptyList()
        if (photoList.isNotEmpty()) {
            binding.rvReviewPhotos.visibility = View.VISIBLE
            val photoAdapter = ReviewImageAdapter(photoList) { photoIndex ->
                onPhotoClick(photoList, photoIndex)
            }
            binding.rvReviewPhotos.layoutManager = LinearLayoutManager(holder.itemView.context, LinearLayoutManager.HORIZONTAL, false)
            binding.rvReviewPhotos.adapter = photoAdapter
        } else {
            binding.rvReviewPhotos.visibility = View.GONE
            binding.rvReviewPhotos.adapter = null
        }

        // 7. Click Listeners
        binding.btnReadMore.setOnClickListener { onToggleExpand(item) }
        binding.btnViewPlace.setOnClickListener { onViewPlaceClick(item) }
        binding.btnEditReview.setOnClickListener { onEditClick(item) }
        binding.btnDeleteReview.setOnClickListener { onDeleteClick(item) }
        holder.itemView.setOnClickListener { onViewPlaceClick(item) }
    }

    private fun renderStarRating(holder: ViewHolder, rating: Int) {
        val stars = listOf(
            holder.binding.star1,
            holder.binding.star2,
            holder.binding.star3,
            holder.binding.star4,
            holder.binding.star5
        )

        val activeColor = ContextCompat.getColor(holder.itemView.context, R.color.amber_400)
        val inactiveColor = ContextCompat.getColor(holder.itemView.context, R.color.card_border)

        for (i in 0 until 5) {
            if (i < rating) {
                stars[i].setColorFilter(activeColor)
            } else {
                stars[i].setColorFilter(inactiveColor)
            }
        }
    }

    private fun formatTimestamp(created: String, updated: String?): String {
        return if (!updated.isNullOrBlank() && updated != created) {
            "Updated recently"
        } else {
            "Reviewed recently"
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<UserReviewDomainModel>() {
            override fun areItemsTheSame(oldItem: UserReviewDomainModel, newItem: UserReviewDomainModel): Boolean {
                return oldItem.reviewUuid == newItem.reviewUuid
            }

            override fun areContentsTheSame(oldItem: UserReviewDomainModel, newItem: UserReviewDomainModel): Boolean {
                return oldItem == newItem
            }
        }
    }
}
