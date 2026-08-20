from typing import Any, Dict, Optional
from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.logging_config import logger


class AppException(Exception):
    """Base application exception for all domain and infrastructure errors."""
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Any] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class ValidationException(AppException):
    """Raised for business logic or schema validation failures."""
    def __init__(self, message: str = "Validation failed", details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            details=details
        )


class ExternalAPIException(AppException):
    """Raised when an external API service request fails."""
    def __init__(self, service_name: str, message: str = "External API request failed", details: Optional[Any] = None):
        super().__init__(
            message=f"[{service_name}] {message}",
            code="EXTERNAL_API_ERROR",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details
        )


class AuthenticationException(AppException):
    """Raised for missing or invalid authentication credentials."""
    def __init__(self, message: str = "Invalid authentication credentials"):
        super().__init__(
            message=message,
            code="AUTHENTICATION_ERROR",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class AuthorizationException(AppException):
    """Raised when user role permissions prevent an action."""
    def __init__(self, message: str = "Operation forbidden with current access permissions"):
        super().__init__(
            message=message,
            code="AUTHORIZATION_ERROR",
            status_code=status.HTTP_403_FORBIDDEN
        )


class ResourceNotFoundException(AppException):
    """Raised when a requested resource does not exist."""
    def __init__(self, entity_name: str = "Resource", identifier: Any = ""):
        message = f"{entity_name} with identifier '{identifier}' was not found." if identifier else f"{entity_name} not found."
        super().__init__(
            message=message,
            code="RESOURCE_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND
        )


class ConflictException(AppException):
    """Raised when an operation violates unique constraints or creates a resource conflict."""
    def __init__(self, entity_name: str = "Resource", field: str = "", value: Any = ""):
        message = f"{entity_name} with {field} '{value}' already exists." if field else f"{entity_name} conflict."
        super().__init__(
            message=message,
            code="RESOURCE_CONFLICT",
            status_code=status.HTTP_409_CONFLICT
        )


class DatabaseException(AppException):
    """Raised for unexpected database execution failures."""
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(
            message=message,
            code="DATABASE_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ExternalServiceException(AppException):
    """Raised when third-party integrations fail."""
    def __init__(self, service_name: str, message: str):
        super().__init__(
            message=f"External service '{service_name}' failure: {message}",
            code="EXTERNAL_SERVICE_ERROR",
            status_code=status.HTTP_502_BAD_GATEWAY
        )


class RateLimitException(AppException):
    """Raised when request rate limits are exceeded."""
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(
            message=message,
            code="RATE_LIMIT_EXCEEDED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS
        )


class InternalServerException(AppException):
    """Raised for unhandled internal server failures."""
    def __init__(self, message: str = "An internal server error occurred"):
        super().__init__(
            message=message,
            code="INTERNAL_SERVER_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Backward Compatibility Aliases
DomainException = AppException
EntityNotFoundException = ResourceNotFoundException
DuplicateEntityException = ConflictException
UnauthorizedException = AuthenticationException
ForbiddenException = AuthorizationException


# FastAPI Global Exception Handlers

async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handler for all custom AppExceptions returning standardized JSON envelope."""
    headers = {}
    if exc.status_code == status.HTTP_401_UNAUTHORIZED:
        headers["WWW-Authenticate"] = "Bearer"

    return JSONResponse(
        status_code=exc.status_code,
        headers=headers,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            }
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handler for standard FastAPI HTTPExceptions."""
    code_map = {
        401: "AUTHENTICATION_ERROR",
        403: "AUTHORIZATION_ERROR",
        404: "RESOURCE_NOT_FOUND",
        409: "RESOURCE_CONFLICT",
        422: "VALIDATION_ERROR",
        429: "RATE_LIMIT_EXCEEDED"
    }
    code = code_map.get(exc.status_code, "HTTP_ERROR")

    return JSONResponse(
        status_code=exc.status_code,
        headers=getattr(exc, "headers", None),
        content={
            "success": False,
            "error": {
                "code": code,
                "message": str(exc.detail),
                "details": None
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handler for Pydantic RequestValidationErrors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request body or parameter validation failed",
                "details": exc.errors()
            }
        }
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Fallback handler catching unhandled global exceptions without leaking stack traces."""
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred",
                "details": None
            }
        }
    )


# Alias for backward compatibility
domain_exception_handler = app_exception_handler
