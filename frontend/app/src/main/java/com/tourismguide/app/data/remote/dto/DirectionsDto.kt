package com.tourismguide.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.maplibre.android.geometry.LatLng

@Serializable
data class DirectionsGeometryDto(
    @SerialName("type") val type: String = "LineString",
    @SerialName("coordinates") val coordinates: List<List<Double>> = emptyList()
)

@Serializable
data class DirectionsDto(
    @SerialName("found") val found: Boolean = true,
    @SerialName("distance_meters") val distanceMeters: Double = 0.0,
    @SerialName("duration_seconds") val durationSeconds: Double = 0.0,
    @SerialName("distance_km") val distanceKm: Double = 0.0,
    @SerialName("duration_minutes") val durationMinutes: Int = 0,
    @SerialName("polyline") val polyline: String = "",
    @SerialName("geometry_geojson") val geometryGeoJson: DirectionsGeometryDto? = null,
    @SerialName("geometry") val geometry: DirectionsGeometryDto? = null
) {
    val finalDistanceKm: Double
        get() = if (distanceKm > 0) distanceKm else distanceMeters / 1000.0

    val finalDurationMinutes: Int
        get() = if (durationMinutes > 0) durationMinutes else (durationSeconds / 60.0).toInt()

    fun extractWaypoints(): List<LatLng> {
        val geo = geometryGeoJson ?: geometry
        if (geo != null && geo.coordinates.isNotEmpty()) {
            return geo.coordinates.mapNotNull { coord ->
                if (coord.size >= 2) LatLng(coord[1], coord[0]) else null
            }
        }
        return emptyList()
    }
}
