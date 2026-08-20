package com.example.nearby.presentation.gallery.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.databinding.ItemGalleryGridBinding
import com.tourismguide.app.data.remote.dto.PlacePhotoDto

class GalleryGridAdapter(
    private val onPhotoClick: (Int, PlacePhotoDto) -> Unit
) : ListAdapter<PlacePhotoDto, GalleryGridAdapter.PhotoViewHolder>(PhotoDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PhotoViewHolder {
        val binding = ItemGalleryGridBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return PhotoViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PhotoViewHolder, position: Int) {
        holder.bind(getItem(position), position)
    }

    inner class PhotoViewHolder(
        private val binding: ItemGalleryGridBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: PlacePhotoDto, position: Int) {
            val url = item.displayUrl
            if (url.isNotEmpty()) {
                binding.ivGalleryItem.load(url)
            }
            binding.root.setOnClickListener { onPhotoClick(position, item) }
        }
    }

    class PhotoDiffCallback : DiffUtil.ItemCallback<PlacePhotoDto>() {
        override fun areItemsTheSame(oldItem: PlacePhotoDto, newItem: PlacePhotoDto): Boolean =
            oldItem.imageUrl == newItem.imageUrl

        override fun areContentsTheSame(oldItem: PlacePhotoDto, newItem: PlacePhotoDto): Boolean =
            oldItem == newItem
    }
}
