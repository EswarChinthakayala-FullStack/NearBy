package com.example.nearby.presentation.navigation

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import org.maplibre.android.geometry.LatLng
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

@Singleton
class NavigationLocationManager @Inject constructor() {

    suspend fun getInitialUserLocation(context: Context): LatLng {
        if (!hasLocationPermission(context)) {
            return getSystemFallbackLocation(context)
        }

        return try {
            val fusedClient: FusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)

            // Try current high-accuracy location fix first with a 2-second timeout
            val currentLoc = kotlinx.coroutines.withTimeoutOrNull(2000) {
                fetchCurrentLocation(fusedClient)
            }
            if (currentLoc != null) {
                return LatLng(currentLoc.latitude, currentLoc.longitude)
            }

            // Fallback to last known fused location with a 1-second timeout
            val lastLoc = kotlinx.coroutines.withTimeoutOrNull(1000) {
                fetchLastLocation(fusedClient)
            }
            if (lastLoc != null) {
                return LatLng(lastLoc.latitude, lastLoc.longitude)
            }

            // System LocationManager fallback (GPS/Network)
            getSystemFallbackLocation(context)
        } catch (e: Exception) {
            getSystemFallbackLocation(context)
        }
    }

    private suspend fun fetchCurrentLocation(fusedClient: FusedLocationProviderClient): Location? {
        return suspendCoroutine { cont ->
            try {
                val cts = CancellationTokenSource()
                fusedClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cts.token)
                    .addOnSuccessListener { loc -> cont.resume(loc) }
                    .addOnFailureListener { cont.resume(null) }
            } catch (e: SecurityException) {
                cont.resume(null)
            }
        }
    }

    private suspend fun fetchLastLocation(fusedClient: FusedLocationProviderClient): Location? {
        return suspendCoroutine { cont ->
            try {
                fusedClient.lastLocation
                     .addOnSuccessListener { loc -> cont.resume(loc) }
                     .addOnFailureListener { cont.resume(null) }
            } catch (e: SecurityException) {
                cont.resume(null)
            }
        }
    }

    private fun getSystemFallbackLocation(context: Context): LatLng {
        return try {
            val lm = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            val gpsLoc = try { lm?.getLastKnownLocation(LocationManager.GPS_PROVIDER) } catch (e: SecurityException) { null }
            val netLoc = try { lm?.getLastKnownLocation(LocationManager.NETWORK_PROVIDER) } catch (e: SecurityException) { null }

            val bestLoc = gpsLoc ?: netLoc
            if (bestLoc != null) {
                LatLng(bestLoc.latitude, bestLoc.longitude)
            } else {
                LatLng(13.6268, 74.6901) // Fallback default to Tallur
            }
        } catch (e: Exception) {
            LatLng(13.6268, 74.6901) // Fallback default to Tallur
        }
    }

    fun hasLocationPermission(context: Context): Boolean {
        val finePerm = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarsePerm = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
        return finePerm == PackageManager.PERMISSION_GRANTED || coarsePerm == PackageManager.PERMISSION_GRANTED
    }
}
