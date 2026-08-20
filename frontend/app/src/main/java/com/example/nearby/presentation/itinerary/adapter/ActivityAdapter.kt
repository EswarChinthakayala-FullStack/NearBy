package com.example.nearby.presentation.itinerary.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.tourismguide.app.data.remote.dto.ItineraryActivityDto

class ActivityAdapter(
    private val activities: List<ItineraryActivityDto>,
    private val onViewPlaceClick: (String) -> Unit,
    private val onNavigateClick: (ItineraryActivityDto) -> Unit
) : RecyclerView.Adapter<ActivityAdapter.ActivityViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ActivityViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_activity, parent, false)
        return ActivityViewHolder(view)
    }

    override fun getItemCount(): Int = activities.size

    override fun onBindViewHolder(holder: ActivityViewHolder, position: Int) {
        holder.bind(activities[position], position, activities.size)
    }

    inner class ActivityViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvWaypointNumber: TextView? = itemView.findViewById(R.id.tvWaypointNumber)
        private val viewRoadLineTop: View? = itemView.findViewById(R.id.viewRoadLineTop)
        private val viewRoadLineBottom: View? = itemView.findViewById(R.id.viewRoadLineBottom)

        private val tvTime: TextView = itemView.findViewById(R.id.tv_act_time)
        private val tvName: TextView = itemView.findViewById(R.id.tv_act_name)
        private val tvReason: TextView = itemView.findViewById(R.id.tv_act_reason)
        private val tvDuration: TextView = itemView.findViewById(R.id.tv_act_duration)
        private val btnViewPlace: TextView = itemView.findViewById(R.id.btn_act_view_place)
        private val btnNavigate: TextView = itemView.findViewById(R.id.btn_act_navigate)

        fun bind(item: ItineraryActivityDto, position: Int, totalSize: Int) {
            // Set place sequence number badge (1, 2, 3, etc.)
            tvWaypointNumber?.text = "${position + 1}"

            // Top road connector visible except for first item
            viewRoadLineTop?.visibility = if (position == 0) View.INVISIBLE else View.VISIBLE

            // Bottom road connector visible except for last item
            viewRoadLineBottom?.visibility = if (position == totalSize - 1) View.INVISIBLE else View.VISIBLE

            tvTime.text = formatTimeWithPeriod(item.time)
            tvDuration.text = "⏱️ ${item.estimatedDuration} visit"
            tvName.text = "📍 ${if (item.placeName.isNotEmpty()) item.placeName else "Attraction Waypoint"}"
            tvReason.text = item.reason

            btnViewPlace.setOnClickListener { onViewPlaceClick(item.placeSlug) }
            btnNavigate.setOnClickListener { onNavigateClick(item) }
        }

        private fun formatTimeWithPeriod(timeStr: String): String {
            val lower = timeStr.lowercase().trim()
            val period = when {
                lower.contains("08:") || lower.contains("09:") || lower.contains("10:") || lower.contains("11:") || (lower.contains("am") && !lower.contains("12:")) -> "🌅 Morning"
                lower.contains("12:") || lower.contains("01:") || lower.contains("02:") || lower.contains("03:") -> "☀️ Afternoon"
                lower.contains("04:") || lower.contains("05:") || lower.contains("06:") -> "🌆 Sunset"
                else -> "🌙 Evening"
            }
            return "$period • $timeStr"
        }
    }
}
