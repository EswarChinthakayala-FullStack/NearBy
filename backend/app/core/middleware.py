import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger


def get_colorized_status(status_code: int) -> str:
    """Format HTTP status code with ANSI color codes for CLI observability."""
    if 200 <= status_code < 300:
        color = "\033[1;32m"  # Bold Green for 2xx Success
    elif 300 <= status_code < 400:
        color = "\033[1;36m"  # Bold Cyan for 3xx Redirection
    elif 400 <= status_code < 500:
        color = "\033[1;33m"  # Bold Yellow for 4xx Client Error
    elif 500 <= status_code < 600:
        color = "\033[1;31m"  # Bold Red for 5xx Server Error
    else:
        color = "\033[1;37m"  # Bold White default
    return f"{color}{status_code}\033[0m"


def get_colorized_method(method: str) -> str:
    """Format HTTP method with ANSI color codes for CLI observability."""
    colors = {
        "GET": "\033[1;34m",     # Bold Blue
        "POST": "\033[1;32m",    # Bold Green
        "PUT": "\033[1;33m",     # Bold Yellow
        "PATCH": "\033[1;35m",   # Bold Magenta
        "DELETE": "\033[1;31m",  # Bold Red
        "OPTIONS": "\033[1;36m", # Bold Cyan
    }
    color = colors.get(method.upper(), "\033[1;37m")
    return f"{color}{method}\033[0m"


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Middleware extracting or generating unique X-Correlation-ID for observability."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        request.state.correlation_id = correlation_id

        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response


class RequestTimingMiddleware(BaseHTTPMiddleware):
    """Middleware measuring request execution time and logging performance metrics."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        response.headers["X-Process-Time-MS"] = str(process_time_ms)
        
        correlation_id = getattr(request.state, "correlation_id", "N/A")
        colored_method = get_colorized_method(request.method)
        colored_status = get_colorized_status(response.status_code)

        logger.info(
            f"[{correlation_id}] {colored_method} {request.url.path} "
            f"- Status: {colored_status} - Duration: {process_time_ms}ms"
        )
        return response
