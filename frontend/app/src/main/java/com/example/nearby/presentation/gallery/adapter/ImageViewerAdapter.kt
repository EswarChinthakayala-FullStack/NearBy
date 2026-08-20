package com.example.nearby.presentation.gallery.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.databinding.ItemImageViewerBinding
import com.tourismguide.app.data.remote.dto.PlacePhotoDto

class ImageViewerAdapter : ListAdapter<PlacePhotoDto, ImageViewerAdapter.ViewerViewHolder>(ViewerDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewerViewHolder {
        val binding = ItemImageViewerBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewerViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewerViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewerViewHolder(
        private val binding: ItemImageViewerBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: PlacePhotoDto) {
            val url = item.displayUrl
            if (url.isNotEmpty()) {
                binding.ivFullscreenImage.load(url)
            }
        }
    }

    class ViewerDiffCallback : DiffUtil.ItemCallback<PlacePhotoDto>() {
        override fun areItemsTheSame(oldItem: PlacePhotoDto, newItem: PlacePhotoDto): Boolean =
            oldItem.imageUrl == newItem.imageUrl

        override fun areContentsTheSame(oldItem: PlacePhotoDto, newItem: PlacePhotoDto): Boolean =
            oldItem == newItem
    }
}
