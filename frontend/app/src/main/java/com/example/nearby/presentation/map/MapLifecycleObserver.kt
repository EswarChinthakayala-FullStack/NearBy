package com.example.nearby.presentation.map

import android.os.Bundle
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import org.maplibre.android.maps.MapView

/**
 * Lifecycle observer automatically binding MapLibre MapView to Activity/Fragment lifecycle events.
 * Prevents map memory leaks and crash bugs due to unhandled lifecycle calls.
 */
class MapLifecycleObserver(
    private val mapView: MapView,
    private val savedInstanceState: Bundle? = null
) : DefaultLifecycleObserver {

    override fun onCreate(owner: LifecycleOwner) {
        mapView.onCreate(savedInstanceState)
    }

    override fun onStart(owner: LifecycleOwner) {
        mapView.onStart()
    }

    override fun onResume(owner: LifecycleOwner) {
        mapView.onResume()
    }

    override fun onPause(owner: LifecycleOwner) {
        mapView.onPause()
    }

    override fun onStop(owner: LifecycleOwner) {
        mapView.onStop()
    }

    override fun onDestroy(owner: LifecycleOwner) {
        mapView.onDestroy()
        owner.lifecycle.removeObserver(this)
    }
}
