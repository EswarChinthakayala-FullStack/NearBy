from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.image import ReviewImageRead
from app.schemas.user import UserRead


class PlaceReviewSummary(BaseModel):
    """Compact summary of the place for review list items."""
    model_config = ConfigDict(from_attributes=True)

    uuid: str = Field(..., description="Place UUID string")
    slug: str = Field(..., description="Place URL slug")
    name: str = Field(..., description="Place display name")
    category: Optional[str] = Field(None, description="Category name")
    city: Optional[str] = Field(None, description="City location")
    district: Optional[str] = Field(None, description="District location")
    state: Optional[str] = Field(None, description="State location")
    country: Optional[str] = Field(None, description="Country location")
    cover_image: Optional[str] = Field(None, description="Primary cover image URL")
    rating: float = Field(0.0, description="Place average rating")

    @field_validator("category", mode="before")
    @classmethod
    def validate_category(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return v
        if hasattr(v, "name"):
            return getattr(v, "name")
        return str(v)

    @field_validator("rating", mode="before")
    @classmethod
    def validate_rating(cls, v):
        if v is not None:
            try:
                return float(v)
            except (ValueError, TypeError):
                pass
        return 0.0


class ReviewCreate(BaseModel):
    """Review creation request payload."""
    rating: int = Field(..., ge=1, le=5, description="Star rating score between 1 and 5")
    title: Optional[str] = Field(None, max_length=150, description="Review headline title")
    comment: Optional[str] = Field(None, max_length=2000, description="Review comment text")

    @field_validator("comment")
    def validate_comment(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            return v if v else None
        return None


class ReviewUpdate(BaseModel):
    """Review update request payload."""
    rating: Optional[int] = Field(None, ge=1, le=5, description="Updated star rating score")
    title: Optional[str] = Field(None, max_length=150, description="Updated review title")
    comment: Optional[str] = Field(None, max_length=2000, description="Updated review comment text")


class ReviewModerate(BaseModel):
    """Admin review moderation action payload."""
    status: str = Field(..., description="Moderation action: 'approved' or 'rejected'")

    @field_validator("status")
    def validate_status(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in ("approved", "rejected"):
            raise ValueError("Moderation status must be either 'approved' or 'rejected'")
        return v


class ReviewRead(BaseModel):
    """Review read response model (never exposes internal integer IDs)."""
    model_config = ConfigDict(from_attributes=True)

    uuid: str = Field(..., description="Public review UUID string")
    rating: int = Field(..., description="Star rating score (1-5)")
    title: Optional[str] = Field(None, description="Review headline title")
    comment: Optional[str] = Field(None, description="Review comment text")
    status: str = Field(..., description="Moderation status (pending, approved, rejected)")
    created_at: datetime = Field(..., description="Submission timestamp")
    updated_at: datetime = Field(..., description="Last updated timestamp")
    likes: int = Field(0, description="Likes count")
    helpful_count: int = Field(0, description="Helpful votes count")

    # Nested objects
    user: Optional[UserRead] = Field(None, description="Review author user summary")
    images: List[ReviewImageRead] = Field(default_factory=list, description="Attached review images")
    place: Optional[PlaceReviewSummary] = Field(None, description="Associated place summary")


# Backward compatibility alias
ReviewResponse = ReviewRead
