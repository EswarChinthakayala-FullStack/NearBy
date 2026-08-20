package com.example.nearby.presentation.explore.widgets

import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.widget.HorizontalScrollView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.presentation.explore.FilterChipItem
import com.example.nearby.presentation.explore.adapter.FilterChipAdapter

class ActiveFilterBar @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : HorizontalScrollView(context, attrs, defStyleAttr) {

    private val recyclerView = RecyclerView(context).apply {
        layoutManager = LinearLayoutManager(context, LinearLayoutManager.HORIZONTAL, false)
        clipToPadding = false
    }

    private var adapter: FilterChipAdapter? = null

    init {
        addView(recyclerView)
        isHorizontalScrollBarEnabled = false
    }

    fun setup(onRemoveClick: (FilterChipItem) -> Unit) {
        adapter = FilterChipAdapter(onRemoveClick)
        recyclerView.adapter = adapter
    }

    fun submitList(chips: List<FilterChipItem>) {
        adapter?.submitList(chips)
        visibility = if (chips.isEmpty()) View.GONE else View.VISIBLE
    }
}
