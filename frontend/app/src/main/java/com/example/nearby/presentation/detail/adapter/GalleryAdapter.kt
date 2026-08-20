package com.example.nearby.presentation.detail.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.databinding.ItemGalleryPreviewBinding

class GalleryAdapter(
    private val onImageClick: (Int) -> Unit
) : ListAdapter<String, GalleryAdapter.GalleryViewHolder>(GalleryDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GalleryViewHolder {
        val binding = ItemGalleryPreviewBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return GalleryViewHolder(binding)
    }

    override fun onBindViewHolder(holder: GalleryViewHolder, position: Int) {
        holder.bind(getItem(position), position)
    }

    inner class GalleryViewHolder(
        private val binding: ItemGalleryPreviewBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(url: String, position: Int) {
            binding.ivPreviewImage.load(url)
            binding.root.setOnClickListener { onImageClick(position) }
        }
    }

    class GalleryDiffCallback : DiffUtil.ItemCallback<String>() {
        override fun areItemsTheSame(oldItem: String, newItem: String): Boolean = oldItem == newItem
        override fun areContentsTheSame(oldItem: String, newItem: String): Boolean = oldItem == newItem
    }
}
