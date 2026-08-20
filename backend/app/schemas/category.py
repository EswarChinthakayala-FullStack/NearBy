from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryCreate(BaseModel):
    """Category creation request model."""
    name: str = Field(..., min_length=2, max_length=100, description="Category display name")
    slug: Optional[str] = Field(None, max_length=120, description="URL-friendly slug (auto-generated if omitted)")
    icon: Optional[str] = Field(None, max_length=255, description="Category icon vector identifier or URL")
    description: Optional[str] = Field(None, description="Category descriptive text")

    @field_validator("name")
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Category name cannot be empty whitespace")
        return v


class CategoryUpdate(BaseModel):
    """Category update request model."""
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="Updated category name")
    slug: Optional[str] = Field(None, max_length=120, description="Updated category slug")
    icon: Optional[str] = Field(None, max_length=255, description="Updated category icon")
    description: Optional[str] = Field(None, description="Updated category description")


class CategoryRead(BaseModel):
    """Category read response model."""
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Category integer identifier")
    name: str = Field(..., description="Category display name")
    slug: str = Field(..., description="URL slug")
    icon: Optional[str] = Field(None, description="Category icon identifier")
    description: Optional[str] = Field(None, description="Category description")
    created_at: datetime = Field(..., description="Creation timestamp")


CategoryResponse = CategoryRead
