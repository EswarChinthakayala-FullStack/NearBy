package com.example.nearby.presentation.gallery

import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import coil3.load

class GalleryPagerAdapter(
    private val images: List<String>
) : RecyclerView.Adapter<GalleryPagerAdapter.GalleryViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GalleryViewHolder {
        val imageView = ZoomableImageView(parent.context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            scaleType = ImageView.ScaleType.FIT_CENTER
        }
        return GalleryViewHolder(imageView)
    }

    override fun onBindViewHolder(holder: GalleryViewHolder, position: Int) {
        holder.bind(images[position])
    }

    override fun getItemCount(): Int = images.size

    class GalleryViewHolder(private val imageView: ZoomableImageView) : RecyclerView.ViewHolder(imageView) {
        fun bind(url: String) {
            imageView.load(url)
        }
    }
}
