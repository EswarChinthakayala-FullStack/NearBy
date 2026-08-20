package com.example.nearby.utils

object DestinationImageHelper {
    private val destinationMap = mapOf(
        "mysore" to "https://images.unsplash.com/photo-1600100397608-f010f423b971?auto=format&fit=crop&w=1000&q=80",
        "hyderabad" to "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=1000&q=80",
        "ongole" to "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80",
        "tirupati" to "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
        "coorg" to "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80",
        "goa" to "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80",
        "ooty" to "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1000&q=80",
        "araku" to "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80",
        "pondicherry" to "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
        "hampi" to "https://images.unsplash.com/photo-1609949279531-cf48d64bed89?auto=format&fit=crop&w=1000&q=80",
        "munnar" to "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1000&q=80"
    )

    fun getImageUrlForDestination(destination: String): String {
        val raw = destination.lowercase().trim()
        val key = raw.replace(Regex("^(?:temple tour|sightseeing|family trip|trip|tour|visit|places)\\s+(?:in|to|near)\\s+"), "")
        return destinationMap[key]
            ?: destinationMap.entries.find { key.contains(it.key) || raw.contains(it.key) }?.value
            ?: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80"
    }
}
