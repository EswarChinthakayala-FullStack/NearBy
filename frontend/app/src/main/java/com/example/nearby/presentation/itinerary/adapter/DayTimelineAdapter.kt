package com.example.nearby.presentation.itinerary.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.tourismguide.app.data.remote.dto.ItineraryActivityDto
import com.tourismguide.app.data.remote.dto.ItineraryDayDto

class DayTimelineAdapter(
    private val days: List<ItineraryDayDto>,
    private val onViewPlaceClick: (String) -> Unit,
    private val onNavigateClick: (ItineraryActivityDto) -> Unit
) : RecyclerView.Adapter<DayTimelineAdapter.DayViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DayViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_day, parent, false)
        return DayViewHolder(view)
    }

    override fun getItemCount(): Int = days.size

    override fun onBindViewHolder(holder: DayViewHolder, position: Int) {
        holder.bind(days[position])
    }

    inner class DayViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvDayHeader: TextView = itemView.findViewById(R.id.tv_day_header)
        private val tvDayTheme: TextView = itemView.findViewById(R.id.tv_day_theme)
        private val tvActivitiesCount: TextView = itemView.findViewById(R.id.tv_day_activities_count)
        private val rvActivities: RecyclerView = itemView.findViewById(R.id.rv_day_activities)

        fun bind(day: ItineraryDayDto) {
            tvDayHeader.text = "DAY ${day.day}"
            tvDayTheme.text = if (day.theme.isNotBlank()) day.theme else "Day ${day.day} Highlights"
            val count = day.activities.size
            tvActivitiesCount.text = "$count ${if (count == 1) "Place" else "Places"}"

            rvActivities.layoutManager = LinearLayoutManager(itemView.context)
            rvActivities.adapter = ActivityAdapter(day.activities, onViewPlaceClick, onNavigateClick)
        }
    }
}
