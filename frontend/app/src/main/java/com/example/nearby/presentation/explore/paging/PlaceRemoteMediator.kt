package com.example.nearby.presentation.explore.paging

import androidx.paging.ExperimentalPagingApi
import androidx.paging.LoadType
import androidx.paging.PagingState
import androidx.paging.RemoteMediator
import com.example.nearby.presentation.home.PlaceItem

@OptIn(ExperimentalPagingApi::class)
class PlaceRemoteMediator : RemoteMediator<Int, PlaceItem>() {

    override suspend fun load(
        loadType: LoadType,
        state: PagingState<Int, PlaceItem>
    ): MediatorResult {
        return try {
            MediatorResult.Success(endOfPaginationReached = true)
        } catch (e: Exception) {
            MediatorResult.Error(e)
        }
    }
}
