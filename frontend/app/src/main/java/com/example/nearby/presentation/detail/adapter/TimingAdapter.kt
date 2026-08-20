package com.example.nearby.presentation.detail.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.example.nearby.presentation.detail.OpeningHourItem

class TimingAdapter : ListAdapter<OpeningHourItem, TimingAdapter.TimingViewHolder>(TimingDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TimingViewHolder {
        val container = LinearLayout(parent.context).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            setPadding(0, 8, 0, 8)
        }
        val dayTv = TextView(parent.context).apply {
            id = R.id.toast_title
            setTextAppearance(R.style.Typography_BodySmall)
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        }
        val hoursTv = TextView(parent.context).apply {
            id = R.id.toast_message
            setTextAppearance(R.style.Typography_BodySmall)
        }
        container.addView(dayTv)
        container.addView(hoursTv)
        return TimingViewHolder(container)
    }

    override fun onBindViewHolder(holder: TimingViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class TimingViewHolder(
        private val container: LinearLayout
    ) : RecyclerView.ViewHolder(container) {

        fun bind(item: OpeningHourItem) {
            val dayTv = container.findViewById<TextView>(R.id.toast_title)
            val hoursTv = container.findViewById<TextView>(R.id.toast_message)

            dayTv.text = item.day
            hoursTv.text = item.hours

            if (item.isToday) {
                dayTv.setTextColor(ContextCompat.getColor(container.context, R.color.emerald_500))
                hoursTv.setTextColor(ContextCompat.getColor(container.context, R.color.emerald_500))
            } else {
                dayTv.setTextColor(ContextCompat.getColor(container.context, R.color.text_secondary))
                hoursTv.setTextColor(ContextCompat.getColor(container.context, R.color.text_primary))
            }
        }
    }

    class TimingDiffCallback : DiffUtil.ItemCallback<OpeningHourItem>() {
        override fun areItemsTheSame(oldItem: OpeningHourItem, newItem: OpeningHourItem): Boolean = oldItem.day == newItem.day
        override fun areContentsTheSame(oldItem: OpeningHourItem, newItem: OpeningHourItem): Boolean = oldItem == newItem
    }
}
