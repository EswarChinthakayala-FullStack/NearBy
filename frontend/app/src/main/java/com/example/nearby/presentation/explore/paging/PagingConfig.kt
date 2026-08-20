package com.example.nearby.presentation.explore.paging

import androidx.paging.PagingConfig

object ExplorePagingConfig {
    fun defaultConfig(): PagingConfig {
        return PagingConfig(
            pageSize = 20,
            prefetchDistance = 5,
            enablePlaceholders = false,
            initialLoadSize = 20
        )
    }
}
