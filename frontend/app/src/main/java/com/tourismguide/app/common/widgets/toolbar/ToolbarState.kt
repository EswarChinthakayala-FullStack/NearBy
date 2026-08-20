package com.tourismguide.app.common.widgets.toolbar

data class ToolbarState(
    val alpha: Float = 0f,
    val elevationDp: Float = 0f,
    val title: String = "",
    val subtitle: String? = null,
    val isBackVisible: Boolean = false
)
