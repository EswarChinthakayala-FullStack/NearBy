package com.example.nearby.domain.result

/**
 * Categorized Data Error hierarchy separating Network and Local failures.
 */
sealed interface DataError : RootError {
    enum class Network : DataError {
        REQUEST_TIMEOUT,
        UNAUTHORIZED,
        FORBIDDEN,
        NOT_FOUND,
        SERVER_ERROR,
        SERIALIZATION_ERROR,
        NO_INTERNET,
        UNKNOWN
    }

    enum class Local : DataError {
        DISK_FULL,
        DATABASE_ERROR,
        NOT_FOUND,
        UNKNOWN
    }
}
