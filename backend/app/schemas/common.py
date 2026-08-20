from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class PaginationMeta(BaseModel):
    """Metadata envelope for paginated collections."""
    model_config = ConfigDict(from_attributes=True)

    page: int = Field(..., ge=1, description="Current page number (1-indexed)")
    page_size: int = Field(..., ge=1, description="Number of items per page")
    total_items: int = Field(..., ge=0, description="Total items matching filter query across all pages")
    total_pages: int = Field(..., ge=0, description="Total calculated available pages")


class ResponseModel(BaseModel, Generic[T]):
    """Standardized single resource API response envelope."""
    model_config = ConfigDict(from_attributes=True)

    success: bool = Field(True, description="Indicates whether request succeeded")
    message: str = Field("Operation completed successfully.", description="Human-readable response message")
    data: Optional[T] = Field(None, description="Response payload object or null")


class PaginatedResponse(BaseModel, Generic[T]):
    """Standardized paginated list API response envelope."""
    model_config = ConfigDict(from_attributes=True)

    success: bool = Field(True, description="Indicates whether request succeeded")
    message: str = Field("Data retrieved successfully.", description="Human-readable response message")
    data: List[T] = Field(default_factory=list, description="Array of collection items for current page")
    pagination: PaginationMeta = Field(..., description="Pagination metadata information")
