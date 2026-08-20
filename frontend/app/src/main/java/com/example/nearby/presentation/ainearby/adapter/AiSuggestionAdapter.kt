package com.example.nearby.presentation.ainearby.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.databinding.ItemAiChipBinding

class AiSuggestionAdapter(
    private val onSuggestionClick: (String) -> Unit
) : RecyclerView.Adapter<AiSuggestionAdapter.SuggestionViewHolder>() {

    private var suggestions: List<String> = emptyList()

    fun submitList(list: List<String>) {
        this.suggestions = list
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SuggestionViewHolder {
        val binding = ItemAiChipBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return SuggestionViewHolder(binding)
    }

    override fun onBindViewHolder(holder: SuggestionViewHolder, position: Int) {
        holder.bind(suggestions[position])
    }

    override fun getItemCount(): Int = suggestions.size

    inner class SuggestionViewHolder(private val binding: ItemAiChipBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(text: String) {
            binding.tvChipLabel.text = text
            binding.root.setOnClickListener { onSuggestionClick(text) }
        }
    }
}
