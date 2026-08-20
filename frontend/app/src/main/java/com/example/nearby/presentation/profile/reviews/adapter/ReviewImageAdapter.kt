package com.example.nearby.presentation.profile.reviews.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import coil3.request.crossfade
import com.example.nearby.databinding.ItemReviewImageBinding

class ReviewImageAdapter(
    private val images: List<String>,
    private val onPhotoClick: (Int) -> Unit
) : RecyclerView.Adapter<ReviewImageAdapter.ViewHolder>() {

    private val maxDisplayCount = 5

    inner class ViewHolder(val binding: ItemReviewImageBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemReviewImageBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun getItemCount(): Int {
        return if (images.size > maxDisplayCount) maxDisplayCount else images.size
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val imageUrl = images[position]
        holder.binding.ivReviewPhoto.load(imageUrl) {
            crossfade(true)
        }

        if (position == maxDisplayCount - 1 && images.size > maxDisplayCount) {
            val overflowCount = images.size - maxDisplayCount + 1
            holder.binding.tvMoreOverlay.visibility = View.VISIBLE
            holder.binding.tvMoreOverlay.text = "+$overflowCount"
        } else {
            holder.binding.tvMoreOverlay.visibility = View.GONE
        }

        holder.itemView.setOnClickListener {
            onPhotoClick(position)
        }
    }
}
