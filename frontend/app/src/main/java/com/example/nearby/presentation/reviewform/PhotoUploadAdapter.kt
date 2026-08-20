package com.example.nearby.presentation.reviewform

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.databinding.ItemPhotoUploadBinding

class PhotoUploadAdapter(
    private val photos: MutableList<String>,
    private val onRemoveClick: (Int) -> Unit
) : RecyclerView.Adapter<PhotoUploadAdapter.PhotoViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PhotoViewHolder {
        val binding = ItemPhotoUploadBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return PhotoViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PhotoViewHolder, position: Int) {
        holder.bind(photos[position], position)
    }

    override fun getItemCount(): Int = photos.size

    inner class PhotoViewHolder(private val binding: ItemPhotoUploadBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(url: String, position: Int) {
            binding.ivUploadPhoto.load(url)
            binding.btnRemovePhoto.setOnClickListener { onRemoveClick(position) }
        }
    }
}
