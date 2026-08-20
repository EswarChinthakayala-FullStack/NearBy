package com.example.nearby.data.map

import com.example.nearby.domain.map.MapStyleProvider
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CartoVectorStyleProvider @Inject constructor() : MapStyleProvider {
    override val providerName: String = "Carto Voyager OpenStreetMap"

    override fun getLightStyleUrl(): String = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"

    override fun getDarkStyleUrl(): String = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
}
