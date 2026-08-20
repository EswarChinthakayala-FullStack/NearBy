package com.example.nearby.presentation.itinerary.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R

class AiChatSuggestionAdapter(
    private val suggestions: List<String>,
    private val onSuggestionClick: (String) -> Unit
) : RecyclerView.Adapter<AiChatSuggestionAdapter.SuggestionViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SuggestionViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_chat_suggestion, parent, false)
        return SuggestionViewHolder(view as TextView)
    }

    override fun onBindViewHolder(holder: SuggestionViewHolder, position: Int) {
        holder.bind(suggestions[position])
    }

    override fun getItemCount(): Int = suggestions.size

    inner class SuggestionViewHolder(private val tvChip: TextView) : RecyclerView.ViewHolder(tvChip) {
        fun bind(text: String) {
            tvChip.text = text
            tvChip.setOnClickListener { onSuggestionClick(text) }
        }
    }
}
