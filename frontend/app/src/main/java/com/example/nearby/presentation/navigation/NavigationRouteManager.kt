package com.example.nearby.presentation.navigation

import com.example.nearby.R
import com.example.nearby.common.Logger
import com.tourismguide.app.data.remote.api.DirectionsApiService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import org.maplibre.android.geometry.LatLng
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

data class RouteCalculationResult(
    val waypoints: List<LatLng>,
    val distanceKm: Double,
    val durationMinutes: Int,
    val steps: List<RouteStepItem>
)

@Singleton
class NavigationRouteManager @Inject constructor(
    private val directionsApiService: DirectionsApiService,
    private val logger: Logger
) {
    private val okHttpClient = OkHttpClient()

    suspend fun calculateRoute(
        originLat: Double,
        originLng: Double,
        destLat: Double,
        destLng: Double
    ): RouteCalculationResult {
        val start = LatLng(originLat, originLng)
        val end = LatLng(destLat, destLng)
        val distanceKm = calculateHaversineDistanceKm(originLat, originLng, destLat, destLng)
        val durationMins = (distanceKm * 0.9).toInt().coerceAtLeast(8)

        // 1. Try Backend API
        try {
            val response = directionsApiService.getDirections(originLat, originLng, destLat, destLng)
            if (response.isSuccessful && response.body()?.data != null) {
                val data = response.body()!!.data!!
                val apiKm = data.finalDistanceKm
                val apiMins = data.finalDurationMinutes
                val extracted = data.extractWaypoints()

                if (extracted.size > 2) {
                    logger.d("NavigationRouteManager fetched route from Backend API: ${extracted.size} waypoints")
                    return RouteCalculationResult(
                        waypoints = extracted,
                        distanceKm = if (apiKm > 0) apiKm else distanceKm,
                        durationMinutes = if (apiMins > 0) apiMins else durationMins,
                        steps = generateTimelineSteps("Destination", if (apiKm > 0) apiKm else distanceKm)
                    )
                }
            }
        } catch (e: Exception) {
            logger.w("Backend routing API note: ${e.message}")
        }

        // 2. Try OSRM Public Driving Endpoint Directly for exact road geometry
        try {
            val osrmWaypoints = fetchDirectOsrmRoute(originLat, originLng, destLat, destLng)
            if (osrmWaypoints.size > 2) {
                logger.d("NavigationRouteManager fetched direct OSRM route: ${osrmWaypoints.size} road points")
                return RouteCalculationResult(
                    waypoints = osrmWaypoints,
                    distanceKm = distanceKm,
                    durationMinutes = durationMins,
                    steps = generateTimelineSteps("Destination", distanceKm)
                )
            }
        } catch (e: Exception) {
            logger.w("Direct OSRM route note: ${e.message}")
        }

        // 3. Fallback to Bezier curve if offline
        val waypoints = generateCurvedRouteWaypoints(start, end)
        return RouteCalculationResult(
            waypoints = waypoints,
            distanceKm = distanceKm,
            durationMinutes = durationMins,
            steps = generateTimelineSteps("Destination", distanceKm)
        )
    }

    private suspend fun fetchDirectOsrmRoute(
        originLat: Double,
        originLng: Double,
        destLat: Double,
        destLng: Double
    ): List<LatLng> = withContext(Dispatchers.IO) {
        try {
            val url = "https://router.project-osrm.org/route/v1/driving/$originLng,$originLat;$destLng,$destLat?overview=full&geometries=geojson&steps=true"
            val request = Request.Builder().url(url).build()
            val response = okHttpClient.newCall(request).execute()

            if (response.isSuccessful) {
                val bodyStr = response.body?.string() ?: return@withContext emptyList()
                val json = JSONObject(bodyStr)
                val routes = json.optJSONArray("routes") ?: return@withContext emptyList()
                if (routes.length() > 0) {
                    val routeObj = routes.getJSONObject(0)
                    val geometry = routeObj.optJSONObject("geometry") ?: return@withContext emptyList()
                    val coordinates = geometry.optJSONArray("coordinates") ?: return@withContext emptyList()

                    val resultPoints = mutableListOf<LatLng>()
                    for (i in 0 until coordinates.length()) {
                        val coord = coordinates.getJSONArray(i)
                        val lng = coord.getDouble(0)
                        val lat = coord.getDouble(1)
                        resultPoints.add(LatLng(lat, lng))
                    }
                    return@withContext resultPoints
                }
            }
        } catch (e: Exception) {
            logger.w("fetchDirectOsrmRoute note: ${e.message}")
        }
        emptyList()
    }

    private fun generateCurvedRouteWaypoints(start: LatLng, end: LatLng, stepsCount: Int = 36): List<LatLng> {
        val points = mutableListOf<LatLng>()
        val midLat = (start.latitude + end.latitude) / 2.0
        val midLng = (start.longitude + end.longitude) / 2.0

        val latDiff = end.latitude - start.latitude
        val lngDiff = end.longitude - start.longitude
        val controlLat = midLat + (lngDiff * 0.12)
        val controlLng = midLng - (latDiff * 0.12)

        for (i in 0..stepsCount) {
            val t = i.toDouble() / stepsCount.toDouble()
            val lat = (1 - t) * (1 - t) * start.latitude + 2 * (1 - t) * t * controlLat + t * t * end.latitude
            val lng = (1 - t) * (1 - t) * start.longitude + 2 * (1 - t) * t * controlLng + t * t * end.longitude
            points.add(LatLng(lat, lng))
        }
        return points
    }

    private fun generateTimelineSteps(name: String, distanceKm: Double): List<RouteStepItem> {
        val seg = distanceKm / 4.0
        return listOf(
            RouteStepItem("1", "Head north from Current Location", "0.2 km", "1 min", R.drawable.ic_check),
            RouteStepItem("2", "Turn right onto Express Highway / Ring Road", "${String.format("%.1f", seg)} km", "4 min", R.drawable.ic_check),
            RouteStepItem("3", "Continue straight through Central Flyover", "${String.format("%.1f", seg * 2)} km", "7 min", R.drawable.ic_check),
            RouteStepItem("4", "Arrive at $name", "${String.format("%.1f", seg * 0.5)} km", "2 min", R.drawable.ic_check)
        )
    }

    private fun calculateHaversineDistanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val r = 6371.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2) * sin(dLon / 2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return r * c
    }
}
