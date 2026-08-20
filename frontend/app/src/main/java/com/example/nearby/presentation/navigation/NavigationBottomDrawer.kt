package com.example.nearby.presentation.navigation

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import androidx.recyclerview.widget.LinearLayoutManager
import coil3.load
import com.example.nearby.databinding.ViewNavigationBottomDrawerBinding
import com.example.nearby.presentation.navigation.adapter.RouteStepAdapter

class NavigationBottomDrawer @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewNavigationBottomDrawerBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    private var isExpanded: Boolean = false
    private val stepAdapter = RouteStepAdapter()

    init {
        binding.rvRouteTimeline.layoutManager = LinearLayoutManager(context)
        binding.rvRouteTimeline.adapter = stepAdapter

        binding.drawerHeaderHandle.setOnClickListener {
            toggleExpandState()
        }
    }

    fun setDestinationData(
        title: String,
        category: String,
        etaMins: Int,
        distKm: Double,
        coverUrl: String
    ) {
        binding.tvDrawerTitle.text = title
        binding.tvDrawerCategory.text = "#${category.uppercase()}"
        binding.tvDrawerEta.text = "$etaMins min"
        binding.tvDrawerDistance.text = "(${String.format("%.1f", distKm)} km) • OSRM Route"
        if (coverUrl.isNotEmpty()) {
            binding.ivDrawerCover.load(coverUrl)
        }
    }

    fun submitTimelineSteps(steps: List<RouteStepItem>) {
        stepAdapter.submitList(steps)
    }

    fun setOnStartNavigationClickListener(listener: OnClickListener) {
        binding.btnStartGuidance.setOnClickListener(listener)
    }

    private fun toggleExpandState() {
        isExpanded = !isExpanded
        binding.expandedContainer.visibility = if (isExpanded) View.VISIBLE else View.GONE
    }
}
