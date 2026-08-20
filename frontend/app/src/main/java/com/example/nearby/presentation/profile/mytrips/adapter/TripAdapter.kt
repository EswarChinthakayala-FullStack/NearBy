package com.example.nearby.presentation.profile.mytrips.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil3.load
import coil3.request.crossfade
import com.example.nearby.R
import com.example.nearby.databinding.ItemTripCardBinding
import com.example.nearby.presentation.profile.mytrips.model.TripDomainModel
import com.example.nearby.utils.DestinationImageHelper

class TripAdapter(
    private val onOpenTripClick: (TripDomainModel) -> Unit,
    private val onDeleteClick: (TripDomainModel) -> Unit,
    private val onShareClick: (TripDomainModel) -> Unit,
    private val onToggleExpand: (TripDomainModel) -> Unit
) : ListAdapter<TripDomainModel, TripAdapter.ViewHolder>(DiffCallback) {

    inner class ViewHolder(val binding: ItemTripCardBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemTripCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = getItem(position)
        val binding = holder.binding
        val context = holder.itemView.context

        // 1. Cover Image Header
        val imageUrl = if (item.coverImage.isNotBlank()) {
            item.coverImage
        } else {
            DestinationImageHelper.getImageUrlForDestination(item.destination)
        }

        binding.ivTripCover.load(imageUrl) {
            crossfade(true)
        }

        binding.tvTripTitle.text = item.title.ifEmpty { "${item.daysCount}-Day Trip to ${item.destination}" }
        binding.tvTripDestination.text = "📍 ${item.destination} • ${item.daysCount} ${if (item.daysCount == 1) "Day" else "Days"}"

        // 2. Badges
        binding.tvTripThemeBadge.text = item.theme.ifEmpty { "Cultural" }
        val statusText = when (item.status.lowercase()) {
            "completed" -> "Completed"
            "planning", "draft" -> "Planning"
            else -> "Saved"
        }
        binding.tvTripStatusBadge.text = statusText

        // 3. Prompt Preview
        val promptText = item.prompt.ifEmpty { "Explore top attractions and cultural spots in ${item.destination}" }
        binding.tvTripPromptPreview.text = "\"$promptText\""

        if (item.isExpanded) {
            binding.tvTripPromptPreview.maxLines = Int.MAX_VALUE
            binding.btnReadMorePrompt.text = "Show Less"
            binding.btnReadMorePrompt.visibility = View.VISIBLE
        } else {
            binding.tvTripPromptPreview.maxLines = 2
            binding.btnReadMorePrompt.text = "Read More"
            binding.btnReadMorePrompt.visibility = if (promptText.length > 90) View.VISIBLE else View.GONE
        }

        // 4. Stats Badges
        binding.tvBadgeDays.text = "⏱ ${item.daysCount} ${if (item.daysCount == 1) "Day" else "Days"}"
        binding.tvBadgePlaces.text = "📍 ${item.placesCount} Places"
        binding.tvBadgeDistance.text = String.format(java.util.Locale.US, "🚗 %.1f KM", item.estimatedDistanceKm)
        binding.tvBadgeWeather.text = "☀ ${item.weatherTempC.toInt()}°C ${item.weatherCondition}"

        // 5. Created Date
        val createdLabel = formatCreatedAt(item.createdAt)
        binding.tvTripCreatedDate.text = createdLabel

        // 6. Action Listeners
        binding.btnReadMorePrompt.setOnClickListener { onToggleExpand(item) }
        binding.btnOpenTrip.setOnClickListener { onOpenTripClick(item) }
        binding.btnDeleteTrip.setOnClickListener { onDeleteClick(item) }
        binding.btnShareTrip.setOnClickListener { onShareClick(item) }
        holder.itemView.setOnClickListener { onOpenTripClick(item) }
    }

    private fun formatCreatedAt(rawDate: String): String {
        if (rawDate.isBlank()) return "Created recently"
        return try {
            if (rawDate.length >= 10) {
                "Created ${rawDate.take(10)}"
            } else {
                "Created recently"
            }
        } catch (e: Exception) {
            "Created recently"
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<TripDomainModel>() {
            override fun areItemsTheSame(oldItem: TripDomainModel, newItem: TripDomainModel): Boolean {
                return oldItem.uuid == newItem.uuid
            }

            override fun areContentsTheSame(oldItem: TripDomainModel, newItem: TripDomainModel): Boolean {
                return oldItem == newItem
            }
        }
    }
}
