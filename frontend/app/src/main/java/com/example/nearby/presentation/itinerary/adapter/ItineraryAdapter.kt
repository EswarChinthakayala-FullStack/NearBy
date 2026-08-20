package com.example.nearby.presentation.itinerary.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import com.example.nearby.R
import com.tourismguide.app.data.remote.dto.ItineraryListItemDto

class ItineraryAdapter(
    private val onItemClick: (ItineraryListItemDto) -> Unit,
    private val onRegenerateClick: (ItineraryListItemDto) -> Unit,
    private val onDuplicateClick: (ItineraryListItemDto) -> Unit,
    private val onDeleteClick: (ItineraryListItemDto) -> Unit
) : ListAdapter<ItineraryListItemDto, ItineraryAdapter.ItineraryViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItineraryViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_itinerary, parent, false)
        return ItineraryViewHolder(view)
    }

    override fun onBindViewHolder(holder: ItineraryViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ItineraryViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val ivCover: ImageView = itemView.findViewById(R.id.iv_item_cover)
        private val tvDestination: TextView = itemView.findViewById(R.id.tv_item_destination)
        private val tvDurationBadge: TextView = itemView.findViewById(R.id.tv_item_duration_badge)
        private val tvTitle: TextView = itemView.findViewById(R.id.tv_item_title)
        private val tvPrompt: TextView = itemView.findViewById(R.id.tv_item_prompt)
        private val tvPlacesCount: TextView = itemView.findViewById(R.id.tv_item_places_count)
        private val tvDistance: TextView = itemView.findViewById(R.id.tv_item_distance)
        private val tvTheme: TextView = itemView.findViewById(R.id.tv_item_theme)
        private val tvDate: TextView = itemView.findViewById(R.id.tv_item_date)
        private val btnView: TextView = itemView.findViewById(R.id.btn_item_view)
        private val btnDelete: TextView = itemView.findViewById(R.id.btn_item_delete)

        fun bind(item: ItineraryListItemDto) {
            val daysLabel = item.travelDates ?: if (item.dayCount == 1) "1 Day" else "${item.dayCount} Days"
            tvDurationBadge.text = daysLabel
            tvDestination.text = "📍 ${item.destination}"
            tvTitle.text = item.title
            tvPrompt.text = "\"${item.originalPrompt ?: "Explore ${item.destination}"}\""
            tvPlacesCount.text = "${item.placesCount} Places"
            tvDistance.text = "${item.estimatedDistanceKm} km"
            tvTheme.text = item.theme ?: "Cultural"
            tvDate.text = item.createdAt?.take(10) ?: "Saved Itinerary"

            val imageUrl = com.example.nearby.utils.DestinationImageHelper.getImageUrlForDestination(item.destination)
            ivCover.load(imageUrl)

            itemView.setOnClickListener { onItemClick(item) }
            btnView.setOnClickListener { onItemClick(item) }
            btnDelete.setOnClickListener { onDeleteClick(item) }
        }
    }

    companion object DiffCallback : DiffUtil.ItemCallback<ItineraryListItemDto>() {
        override fun areItemsTheSame(oldItem: ItineraryListItemDto, newItem: ItineraryListItemDto): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: ItineraryListItemDto, newItem: ItineraryListItemDto): Boolean {
            return oldItem == newItem
        }
    }
}
