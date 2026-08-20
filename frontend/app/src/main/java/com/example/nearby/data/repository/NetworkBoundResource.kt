package com.example.nearby.data.repository

import com.example.nearby.domain.result.DataError
import com.example.nearby.domain.result.Result
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map

/**
 * Offline-first resource helper following clean architecture caching strategies.
 * Flow: Local Cache -> Remote Network -> Save Cache -> Emit Fresh Data
 */
inline fun <ResultType, RequestType> networkBoundResource(
    crossinline query: () -> Flow<ResultType>,
    crossinline fetch: suspend () -> RequestType,
    crossinline saveFetchResult: suspend (RequestType) -> Unit,
    crossinline shouldFetch: (ResultType?) -> Boolean = { true },
    crossinline onFetchFailed: (Throwable) -> DataError.Network = { DataError.Network.UNKNOWN }
): Flow<Result<ResultType, DataError.Network>> = flow {

    emit(Result.Success(query().map { it }.let { flow ->
        // First emission from local database cache
        null
    } ?: return@flow))

    // Note: Emits local data first
    query().collect { cachedData ->
        emit(Result.Success(cachedData))

        if (shouldFetch(cachedData)) {
            try {
                val fetchedData = fetch()
                saveFetchResult(fetchedData)
            } catch (throwable: Throwable) {
                val error = onFetchFailed(throwable)
                emit(Result.Error(error))
            }
        }
    }
}
