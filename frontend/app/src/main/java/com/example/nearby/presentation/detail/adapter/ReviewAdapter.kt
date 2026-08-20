package com.example.nearby.presentation.detail.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.databinding.ItemReviewCardBinding
import com.example.nearby.presentation.detail.ReviewItem

class ReviewAdapter(
    private val onImageClick: (String) -> Unit = {}
) : ListAdapter<ReviewItem, ReviewAdapter.ReviewViewHolder>(ReviewDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReviewViewHolder {
        val binding = ItemReviewCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ReviewViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ReviewViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ReviewViewHolder(
        private val binding: ItemReviewCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: ReviewItem) {
            binding.tvReviewerName.text = item.authorName.ifEmpty { "Traveler" }

            val initial = if (item.authorName.isNotEmpty()) item.authorName.take(1).uppercase() else "T"
            binding.tvReviewerInitial.text = initial

            if (item.avatarUrl.isNotEmpty()) {
                binding.ivReviewerAvatar.visibility = View.VISIBLE
                binding.tvReviewerInitial.visibility = View.GONE
                binding.ivReviewerAvatar.load(item.avatarUrl)
            } else {
                binding.ivReviewerAvatar.visibility = View.GONE
                binding.tvReviewerInitial.visibility = View.VISIBLE
            }

            binding.tvReviewDate.text = item.dateAgo
            binding.tvReviewRating.text = "★ ${item.rating}"
            binding.tvReviewContent.text = item.comment
        }
    }

    class ReviewDiffCallback : DiffUtil.ItemCallback<ReviewItem>() {
        override fun areItemsTheSame(oldItem: ReviewItem, newItem: ReviewItem): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: ReviewItem, newItem: ReviewItem): Boolean = oldItem == newItem
    }
}
