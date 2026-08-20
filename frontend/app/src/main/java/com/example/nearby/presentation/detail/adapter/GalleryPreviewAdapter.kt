package com.example.nearby.presentation.detail.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.R
import com.example.nearby.databinding.ItemGalleryPreviewBinding

class GalleryPreviewAdapter(
    private val onPhotoClick: (Int, String) -> Unit,
    private val onViewAllClick: () -> Unit
) : ListAdapter<String, GalleryPreviewAdapter.PreviewViewHolder>(PreviewDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PreviewViewHolder {
        val binding = ItemGalleryPreviewBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return PreviewViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PreviewViewHolder, position: Int) {
        val list = currentList
        val item = getItem(position)
        val isLast = (position == 5 && list.size > 6)
        holder.bind(item, position, isLast, list.size - 6)
    }

    override fun getItemCount(): Int {
        return super.getItemCount().coerceAtMost(6)
    }

    inner class PreviewViewHolder(
        private val binding: ItemGalleryPreviewBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(url: String, position: Int, isLastOverlay: Boolean, extraCount: Int) {
            if (url.isNotEmpty()) {
                binding.ivPreviewImage.load(url)
            }

            if (isLastOverlay) {
                binding.overlayViewAll.visibility = View.VISIBLE
                binding.tvOverlayCount.text = "+$extraCount\nView All"
                binding.root.setOnClickListener { onViewAllClick() }
            } else {
                binding.overlayViewAll.visibility = View.GONE
                binding.root.setOnClickListener { onPhotoClick(position, url) }
            }
        }
    }

    class PreviewDiffCallback : DiffUtil.ItemCallback<String>() {
        override fun areItemsTheSame(oldItem: String, newItem: String): Boolean = oldItem == newItem
        override fun areContentsTheSame(oldItem: String, newItem: String): Boolean = oldItem == newItem
    }
}
