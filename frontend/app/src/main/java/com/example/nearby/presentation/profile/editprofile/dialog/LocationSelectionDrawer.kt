package com.example.nearby.presentation.profile.editprofile.dialog

import android.content.Context
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.example.nearby.databinding.DialogLocationSelectionBinding
import com.example.nearby.designsystem.CustomBottomDrawer

class LocationSelectionDrawer(
    private val context: Context,
    private val layoutInflater: LayoutInflater,
    private val title: String,
    private val items: List<String>,
    private val onItemSelected: (String) -> Unit
) {

    fun show() {
        try {
            val drawer = CustomBottomDrawer(context)
            val binding = DialogLocationSelectionBinding.inflate(layoutInflater)
            drawer.setTitle(title)
            drawer.setCustomContentView(binding.root)

            binding.tvLocationDrawerTitle.text = title
            binding.searchLocationView.setHint("Search $title...")

            var filteredList = items.toList()
            val adapter = LocationAdapter(filteredList) { selected ->
                onItemSelected(selected)
                drawer.dismissWithAnimation()
            }

            binding.rvLocationItems.layoutManager = LinearLayoutManager(context)
            binding.rvLocationItems.adapter = adapter

            binding.searchLocationView.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    val q = s?.toString()?.trim()?.lowercase() ?: ""
                    filteredList = if (q.isBlank()) {
                        items
                    } else {
                        val matches = items.filter { it.lowercase().contains(q) }
                        if (matches.isEmpty() && q.isNotBlank()) {
                            listOf("Custom: ${s.toString().trim()}") + items
                        } else {
                            matches
                        }
                    }
                    adapter.updateItems(filteredList)
                }
                override fun afterTextChanged(s: Editable?) {}
            })

            drawer.show()
        } catch (e: Exception) {
            Log.e("LocationDrawer", "Error showing location selection drawer: ${e.message}", e)
        }
    }

    private inner class LocationAdapter(
        private var itemList: List<String>,
        private val onClick: (String) -> Unit
    ) : RecyclerView.Adapter<LocationAdapter.ViewHolder>() {

        fun updateItems(newList: List<String>) {
            itemList = newList
            notifyDataSetChanged()
        }

        inner class ViewHolder(val tv: TextView) : RecyclerView.ViewHolder(tv)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val tv = TextView(parent.context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
                setPadding(36, 28, 36, 28)
                textSize = 14.5f
                setTextColor(context.getColor(R.color.text_primary))
                setBackgroundResource(R.drawable.bg_glass_panel)
            }
            return ViewHolder(tv)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val rawItem = itemList[position]
            val displayItem = if (rawItem.startsWith("Custom: ")) rawItem.removePrefix("Custom: ") else rawItem

            holder.tv.text = if (rawItem.startsWith("Custom: ")) "➕ Add \"$displayItem\"" else "📍 $displayItem"
            holder.tv.setOnClickListener { onClick(displayItem) }
        }

        override fun getItemCount(): Int = itemList.size
    }
}
