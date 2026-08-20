package com.example.nearby.data.map

import android.content.Context
import com.example.nearby.common.Logger
import dagger.hilt.android.qualifiers.ApplicationContext
import org.maplibre.android.geometry.LatLngBounds
import org.maplibre.android.offline.OfflineManager
import org.maplibre.android.offline.OfflineRegion
import org.maplibre.android.offline.OfflineTilePyramidRegionDefinition
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OfflineMapManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val logger: Logger
) {
    private val offlineManager: OfflineManager by lazy {
        OfflineManager.getInstance(context)
    }

    fun downloadOfflineRegion(
        regionName: String,
        styleUrl: String,
        bounds: LatLngBounds,
        minZoom: Double = 10.0,
        maxZoom: Double = 16.0,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val pixelDensity = context.resources.displayMetrics.density
        val definition = OfflineTilePyramidRegionDefinition(
            styleUrl,
            bounds,
            minZoom,
            maxZoom,
            pixelDensity
        )

        val metadata = regionName.toByteArray(Charsets.UTF_8)

        offlineManager.createOfflineRegion(
            definition,
            metadata,
            object : OfflineManager.CreateOfflineRegionCallback {
                override fun onCreate(offlineRegion: OfflineRegion) {
                    offlineRegion.setDownloadState(OfflineRegion.STATE_ACTIVE)
                    logger.d("Offline region created: $regionName")
                    onSuccess()
                }

                override fun onError(error: String) {
                    logger.e(null, "Failed to create offline region: $error")
                    onError(error)
                }
            }
        )
    }
}
