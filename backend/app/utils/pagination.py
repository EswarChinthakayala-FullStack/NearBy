from typing import Tuple
from app.schemas.common import PaginationMeta


def get_pagination_params(
    page: int = 1,
    page_size: int = 20,
    max_page_size: int = 100
) -> Tuple[int, int]:
    """Validate pagination params and return (skip, limit) tuple for query offset."""
    validated_page = max(1, page)
    validated_size = max(1, min(page_size, max_page_size))
    skip = (validated_page - 1) * validated_size
    return skip, validated_size


def build_pagination_meta(
    page: int,
    page_size: int,
    total_items: int
) -> PaginationMeta:
    """Construct PaginationMeta metadata payload."""
    page = max(1, page)
    page_size = max(1, page_size)
    total_items = max(0, total_items)

    total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 0

    return PaginationMeta(
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages
    )
