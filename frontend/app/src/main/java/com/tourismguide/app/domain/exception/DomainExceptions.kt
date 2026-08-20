package com.tourismguide.app.domain.exception

sealed class DomainException(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class AuthenticationException(message: String = "Authentication failed") : DomainException(message)
    class NetworkUnavailableException(message: String = "No internet connection") : DomainException(message)
    class ValidationException(message: String = "Validation failed") : DomainException(message)
    class PlaceNotFoundException(message: String = "Place not found") : DomainException(message)
    class SessionExpiredException(message: String = "Session expired") : DomainException(message)
}
