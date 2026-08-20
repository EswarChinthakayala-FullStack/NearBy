package com.example.nearby.domain.map

interface MapStyleProvider {
    val providerName: String
    fun getLightStyleUrl(): String
    fun getDarkStyleUrl(): String
}
