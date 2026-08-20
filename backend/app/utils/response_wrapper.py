from typing import Any, Dict, List, Optional, TypeVar
from app.schemas.common import PaginatedResponse, PaginationMeta, ResponseModel
from app.utils.pagination import build_pagination_meta

T = TypeVar("T")


def success_response(
    data: Optional[T] = None,
    message: str = "Request completed successfully."
) -> ResponseModel[T]:
    """Construct a standardized API success response envelope."""
    return ResponseModel[T](
        success=True,
        message=message,
        data=data
    )


def paginated_response(
    data: List[T],
    page: int,
    page_size: int,
    total_items: int,
    message: str = "Request completed successfully."
) -> PaginatedResponse[T]:
    """Construct a standardized API paginated response envelope."""
    meta = build_pagination_meta(page=page, page_size=page_size, total_items=total_items)
    return PaginatedResponse[T](
        success=True,
        message=message,
        data=data,
        pagination=meta
    )


def error_response(
    message: str = "An error occurred.",
    code: str = "INTERNAL_SERVER_ERROR",
    details: Optional[Any] = None
) -> Dict[str, Any]:
    """Construct a standardized API error response envelope dictionary."""
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details
        }
    }
