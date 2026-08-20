package com.tourismguide.app.domain.model

data class Category(
    val id: String,
    val name: String,
    val icon: String,
    val isSelected: Boolean = false
)
