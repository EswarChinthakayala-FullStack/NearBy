package com.example.nearby.presentation.detail.adapter

import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R

class ImageIndicatorAdapter(
    private var totalCount: Int = 0,
    private var selectedIndex: Int = 0
) : RecyclerView.Adapter<ImageIndicatorAdapter.IndicatorViewHolder>() {

    fun updateCountAndSelection(count: Int, selected: Int) {
        this.totalCount = count
        this.selectedIndex = selected
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): IndicatorViewHolder {
        val dot = View(parent.context).apply {
            val size = (8 * parent.resources.displayMetrics.density).toInt()
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                setMargins(6, 0, 6, 0)
            }
        }
        return IndicatorViewHolder(dot)
    }

    override fun onBindViewHolder(holder: IndicatorViewHolder, position: Int) {
        holder.bind(position == selectedIndex)
    }

    override fun getItemCount(): Int = totalCount

    class IndicatorViewHolder(private val view: View) : RecyclerView.ViewHolder(view) {
        fun bind(isSelected: Boolean) {
            val activeBg = R.drawable.bg_button_primary
            val defaultBg = R.drawable.bg_skip_pill
            view.setBackgroundResource(if (isSelected) activeBg else defaultBg)
        }
    }
}
