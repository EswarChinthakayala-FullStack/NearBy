package com.example.nearby.presentation.detail.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.R
import com.example.nearby.databinding.ItemGalleryPreviewBinding

class GalleryPagerAdapter(
    private val imageUrls: List<String>,
    private val onImageClick: (Int) -> Unit
) : RecyclerView.Adapter<GalleryPagerAdapter.GalleryViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GalleryViewHolder {
        val imageView = ImageView(parent.context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            scaleType = ImageView.ScaleType.CENTER_CROP
        }
        return GalleryViewHolder(imageView)
    }

    override fun onBindViewHolder(holder: GalleryViewHolder, position: Int) {
        holder.bind(imageUrls[position], position)
    }

    override fun getItemCount(): Int = imageUrls.size

    inner class GalleryViewHolder(private val imageView: ImageView) : RecyclerView.ViewHolder(imageView) {
        fun bind(url: String, position: Int) {
            imageView.load(url)
            imageView.setOnClickListener { onImageClick(position) }
        }
    }
}
