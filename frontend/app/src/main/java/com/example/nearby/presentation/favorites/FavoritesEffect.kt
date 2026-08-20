package com.example.nearby.presentation.favorites

sealed interface FavoritesEffect {
    data class ShowToast(val title: String, val message: String, val type: ToastType) : FavoritesEffect
    data class NavigateToDetail(val placeId: String, val name: String, val category: String) : FavoritesEffect
    data class NavigateToDirections(val lat: Double, val lng: Double, val name: String) : FavoritesEffect
    data class SharePlace(val name: String, val url: String) : FavoritesEffect

    enum class ToastType { SUCCESS, ERROR, INFO }
}
