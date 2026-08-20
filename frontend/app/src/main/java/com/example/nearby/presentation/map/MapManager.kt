package com.example.nearby.presentation.map

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.view.LayoutInflater
import android.widget.TextView
import com.example.nearby.R
import com.example.nearby.common.Logger
import com.example.nearby.domain.map.MapStyleProvider
import org.maplibre.android.annotations.IconFactory
import org.maplibre.android.annotations.Marker
import org.maplibre.android.annotations.MarkerOptions
import org.maplibre.android.camera.CameraPosition
import org.maplibre.android.camera.CameraUpdateFactory
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.geometry.LatLngBounds
import org.maplibre.android.maps.MapLibreMap
import org.maplibre.android.maps.Style
import org.maplibre.android.style.layers.LineLayer
import org.maplibre.android.style.layers.Property
import org.maplibre.android.style.layers.PropertyFactory
import org.maplibre.android.style.sources.GeoJsonSource
import org.maplibre.geojson.Feature
import org.maplibre.geojson.LineString
import org.maplibre.geojson.Point
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MapManager @Inject constructor(
    private val styleProvider: MapStyleProvider,
    private val logger: Logger
) {
    private var mapLibreMap: MapLibreMap? = null
    private var currentStyleUrl: String? = null

    // Cache markers & polyline for automatic theme synchronization
    private var cachedUserLocation: LatLng? = null
    private var cachedUserTitle: String? = null
    private var cachedDestLocation: LatLng? = null
    private var cachedDestTitle: String? = null
    private var cachedDestSnippet: String? = null
    private var cachedRoutePoints: List<LatLng>? = null
    private var lastAttachedContext: Context? = null

    fun attachMap(context: Context, map: MapLibreMap, isDarkMode: Boolean, onStyleLoaded: () -> Unit = {}) {
        this.mapLibreMap = map
        this.lastAttachedContext = context.applicationContext
        setupCustomInfoWindow(context.applicationContext, map)
        syncThemeStyle(isDarkMode, onStyleLoaded)
    }

    private fun setupCustomInfoWindow(context: Context, map: MapLibreMap) {
        map.setInfoWindowAdapter(object : MapLibreMap.InfoWindowAdapter {
            override fun getInfoWindow(marker: Marker): android.view.View? {
                val view = LayoutInflater.from(context).inflate(R.layout.view_custom_marker_tooltip, null)
                val tvTitle = view.findViewById<TextView>(R.id.tv_tooltip_title)
                val tvCategory = view.findViewById<TextView>(R.id.tv_tooltip_category)
                tvTitle.text = marker.title
                tvCategory.text = if (marker.snippet.isNullOrEmpty()) "📍 Destination" else marker.snippet
                return view
            }
        })
    }

    fun syncThemeStyle(isDarkMode: Boolean, onStyleLoaded: () -> Unit = {}) {
        val targetStyleUrl = if (isDarkMode) {
            styleProvider.getDarkStyleUrl()
        } else {
            styleProvider.getLightStyleUrl()
        }

        if (currentStyleUrl != targetStyleUrl) {
            currentStyleUrl = targetStyleUrl
            mapLibreMap?.setStyle(Style.Builder().fromUri(targetStyleUrl)) { style ->
                logger.d("MapManager loaded vector style: ${style.uri}")
                reinjectCachedElements()
                onStyleLoaded()
            }
        }
    }

    private fun reinjectCachedElements() {
        val context = lastAttachedContext ?: return
        val map = mapLibreMap ?: return

        setupCustomInfoWindow(context, map)

        cachedUserLocation?.let { pos ->
            addCustomUserMarker(context, pos, cachedUserTitle ?: "My Location")
        }

        cachedDestLocation?.let { pos ->
            addCustomDestinationMarker(context, pos, cachedDestTitle ?: "Destination", cachedDestSnippet ?: "")
        }

        cachedRoutePoints?.let { points ->
            drawRoutePolyline(points, true)
        }
    }

    fun flyToPosition(latLng: LatLng, zoom: Double = 14.5) {
        val position = CameraPosition.Builder()
            .target(latLng)
            .zoom(zoom)
            .build()
        mapLibreMap?.animateCamera(CameraUpdateFactory.newCameraPosition(position), 1200)
    }

    fun fitCameraToBounds(points: List<LatLng>, paddingPx: Int = 120) {
        if (points.isEmpty()) return
        val map = mapLibreMap ?: return
        try {
            val builder = LatLngBounds.Builder()
            points.forEach { builder.include(it) }
            val bounds = builder.build()
            map.animateCamera(
                CameraUpdateFactory.newLatLngBounds(bounds, paddingPx, paddingPx, paddingPx, paddingPx),
                1500
            )
        } catch (e: Exception) {
            logger.w("Failed to fit bounds, falling back to position flyTo: ${e.message}")
            flyToPosition(points.first(), 14.0)
        }
    }

    fun zoomIn() {
        mapLibreMap?.animateCamera(CameraUpdateFactory.zoomIn())
    }

    fun zoomOut() {
        mapLibreMap?.animateCamera(CameraUpdateFactory.zoomOut())
    }

    fun resetCompassNorth() {
        mapLibreMap?.let { map ->
            val resetPos = CameraPosition.Builder(map.cameraPosition)
                .bearing(0.0)
                .tilt(0.0)
                .build()
            map.animateCamera(CameraUpdateFactory.newCameraPosition(resetPos), 800)
        }
    }

    fun addCustomUserMarker(context: Context, position: LatLng, title: String = "My Location") {
        cachedUserLocation = position
        cachedUserTitle = title

        val map = mapLibreMap ?: return
        val bitmap = createUserMarkerBitmap()
        val icon = IconFactory.getInstance(context).fromBitmap(bitmap)
        map.addMarker(
            MarkerOptions()
                .position(position)
                .title(title)
                .snippet("📍 Live GPS Location Fix")
                .icon(icon)
        )
    }

    fun addCustomDestinationMarker(context: Context, position: LatLng, title: String, snippet: String) {
        cachedDestLocation = position
        cachedDestTitle = title
        cachedDestSnippet = snippet

        val map = mapLibreMap ?: return
        val bitmap = createDestinationMarkerBitmap()
        val icon = IconFactory.getInstance(context).fromBitmap(bitmap)
        map.addMarker(
            MarkerOptions()
                .position(position)
                .title(title)
                .snippet(snippet)
                .icon(icon)
        )
    }

    fun addMarker(position: LatLng, title: String, snippet: String = "") {
        mapLibreMap?.addMarker(
            MarkerOptions()
                .position(position)
                .title(title)
                .snippet(snippet)
        )
    }

    private fun createUserMarkerBitmap(): Bitmap {
        val size = 64
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        // Outer pulse ring (Emerald 30% alpha)
        paint.color = Color.parseColor("#4D10B981")
        canvas.drawCircle(32f, 32f, 30f, paint)

        // Middle emerald circle
        paint.color = Color.parseColor("#10B981")
        canvas.drawCircle(32f, 32f, 20f, paint)

        // Inner white dot
        paint.color = Color.WHITE
        canvas.drawCircle(32f, 32f, 10f, paint)

        return bitmap
    }

    private fun createDestinationMarkerBitmap(): Bitmap {
        val width = 64
        val height = 80
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        // Drop shadow
        paint.color = Color.parseColor("#40000000")
        canvas.drawCircle(32f, 74f, 10f, paint)

        // Emerald pin body
        paint.color = Color.parseColor("#10B981")
        val path = Path()
        path.moveTo(32f, 74f)
        path.cubicTo(12f, 48f, 8f, 32f, 8f, 24f)
        path.arcTo(8f, 4f, 56f, 52f, 180f, 180f, false)
        path.cubicTo(56f, 32f, 52f, 48f, 32f, 74f)
        path.close()
        canvas.drawPath(path, paint)

        // White inner circle
        paint.color = Color.WHITE
        canvas.drawCircle(32f, 28f, 14f, paint)

        // Emerald center dot
        paint.color = Color.parseColor("#047857")
        canvas.drawCircle(32f, 28f, 7f, paint)

        return bitmap
    }

    fun clearAll() {
        cachedUserLocation = null
        cachedUserTitle = null
        cachedDestLocation = null
        cachedDestTitle = null
        cachedDestSnippet = null
        cachedRoutePoints = null

        mapLibreMap?.clear()
        mapLibreMap?.getStyle { style ->
            style.removeLayer("route-layer-primary")
            style.removeSource("route-source-primary")
            style.removeLayer("route-layer-alt")
            style.removeSource("route-source-alt")
        }
    }

    fun drawRoutePolyline(routePoints: List<LatLng>, isPrimary: Boolean = true) {
        cachedRoutePoints = routePoints

        mapLibreMap?.getStyle { style ->
            val points = routePoints.map { Point.fromLngLat(it.longitude, it.latitude) }
            val lineString = LineString.fromLngLats(points)
            val sourceId = "route-source-${if (isPrimary) "primary" else "alt"}"
            val layerId = "route-layer-${if (isPrimary) "primary" else "alt"}"

            style.removeLayer(layerId)
            style.removeSource(sourceId)

            style.addSource(GeoJsonSource(sourceId, Feature.fromGeometry(lineString)))

            val strokeColor = if (isPrimary) "#10B981" else "#71717A"
            val strokeWidth = if (isPrimary) 8f else 5f

            val lineLayer = LineLayer(layerId, sourceId).apply {
                setProperties(
                    PropertyFactory.lineColor(Color.parseColor(strokeColor)),
                    PropertyFactory.lineWidth(strokeWidth),
                    PropertyFactory.lineCap(Property.LINE_CAP_ROUND),
                    PropertyFactory.lineJoin(Property.LINE_JOIN_ROUND)
                )
            }

            style.addLayer(lineLayer)
            logger.d("Drawn route polyline layer: $layerId")
        }
    }

    fun detachMap() {
        mapLibreMap = null
        lastAttachedContext = null
        currentStyleUrl = null
    }
}
