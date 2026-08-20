from typing import Any, Dict, Optional
import httpx
from app.core.config import settings
from app.core.exceptions import DomainException
from app.core.logging import logger


class ExternalServiceException(DomainException):
    """Exception raised when an external third-party API request fails."""
    def __init__(self, service_name: str, message: str, status_code: Optional[int] = None):
        self.service_name = service_name
        self.status_code = status_code
        super().__init__(
            message=f"External service '{service_name}' error: {message}",
            code="EXTERNAL_SERVICE_ERROR",
            details={"service": service_name, "status_code": status_code}
        )


class BaseExternalClient:
    """Base asynchronous HTTP client for external integrations."""

    def __init__(self, base_url: str, service_name: str, timeout: float = settings.EXTERNAL_REQUEST_TIMEOUT_SECONDS):
        self.base_url = base_url.rstrip("/")
        self.service_name = service_name
        self.timeout = timeout
        self.headers = {
            "User-Agent": f"{settings.PROJECT_NAME}/1.0 (Contact: admin@nearbyapp.com)"
        }

    async def _get_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(timeout=self.timeout, headers=self.headers)

    async def get(self, endpoint: str = "", params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None, timeout: Optional[float] = None) -> Any:
        """Perform an HTTP GET request."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}" if endpoint else self.base_url
        req_headers = {**self.headers, **(headers or {})}
        req_timeout = timeout if timeout is not None else self.timeout

        async with httpx.AsyncClient(timeout=req_timeout, headers=req_headers) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"[{self.service_name}] HTTP error {e.response.status_code}: {e.response.text}")
                raise ExternalServiceException(self.service_name, f"HTTP Status {e.response.status_code}", e.response.status_code)
            except httpx.RequestError as e:
                logger.error(f"[{self.service_name}] Request failure: {str(e)}")
                raise ExternalServiceException(self.service_name, f"Request failed: {str(e)}")
            except Exception as e:
                logger.error(f"[{self.service_name}] Unexpected error: {str(e)}")
                raise ExternalServiceException(self.service_name, f"Unexpected error: {str(e)}")

    async def post(self, endpoint: str = "", data: Optional[Any] = None, json_data: Optional[Any] = None, headers: Optional[Dict[str, str]] = None, timeout: Optional[float] = None) -> Any:
        """Perform an HTTP POST request."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}" if endpoint else self.base_url
        req_headers = {**self.headers, **(headers or {})}
        req_timeout = timeout if timeout is not None else self.timeout

        async with httpx.AsyncClient(timeout=req_timeout, headers=req_headers) as client:
            try:
                response = await client.post(url, data=data, json=json_data)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"[{self.service_name}] HTTP error {e.response.status_code}: {e.response.text}")
                raise ExternalServiceException(self.service_name, f"HTTP Status {e.response.status_code}", e.response.status_code)
            except httpx.RequestError as e:
                logger.error(f"[{self.service_name}] Request failure: {str(e)}")
                raise ExternalServiceException(self.service_name, f"Request failed: {str(e)}")
            except Exception as e:
                logger.error(f"[{self.service_name}] Unexpected error: {str(e)}")
                raise ExternalServiceException(self.service_name, f"Unexpected error: {str(e)}")
