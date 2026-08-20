from datetime import datetime, time
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.category import CategoryRead
from app.schemas.image import PlaceImageRead


class PlaceTimingCreate(BaseModel):
    """Place operating hours timing creation payload."""
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week: 0=Sunday, 1=Monday...6=Saturday")
    opens_at: Optional[str] = Field(None, description="Opening time in HH:MM:SS format")
    closes_at: Optional[str] = Field(None, description="Closing time in HH:MM:SS format")
    is_closed: bool = Field(False, description="Flag indicating closed for full day")


class PlaceTimingRead(BaseModel):
    """Place operating hours timing read response model."""
    model_config = ConfigDict(from_attributes=True)

    day_of_week: int = Field(..., description="Day of week (0=Sunday...6=Saturday)")
    opens_at: Optional[time] = Field(None, description="Opening time")
    closes_at: Optional[time] = Field(None, description="Closing time")
    is_closed: bool = Field(..., description="Closed day flag")


class PlaceCreate(BaseModel):
    """Tourist place creation request payload."""
    name: str = Field(..., min_length=2, max_length=200, description="Place display title")
    slug: Optional[str] = Field(None, max_length=220, description="URL-friendly slug (auto-generated if omitted)")
    category_id: int = Field(..., ge=1, description="Category integer ID")
    description: Optional[str] = Field(None, description="Detailed descriptive summary")
    history: Optional[str] = Field(None, description="Historical background text")
    address: Optional[str] = Field(None, max_length=500, description="Physical address text")
    city: Optional[str] = Field(None, max_length=120, description="City location")
    state: Optional[str] = Field(None, max_length=120, description="State / Province")
    country: Optional[str] = Field(None, max_length=120, description="Country name")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Geographic latitude degree coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Geographic longitude degree coordinate")
    entry_fee: Optional[str] = Field(None, max_length=100, description="Ticket / entry fee details")
    best_time_to_visit: Optional[str] = Field(None, max_length=150, description="Recommended visiting months/hours")
    status: Optional[str] = Field("draft", description="Publishing status (draft, published, archived)")

    @field_validator("name")
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Place name cannot be blank whitespace")
        return v


class PlaceUpdate(BaseModel):
    """Tourist place update request payload."""
    name: Optional[str] = Field(None, min_length=2, max_length=200, description="Updated place title")
    slug: Optional[str] = Field(None, max_length=220, description="Updated URL slug")
    category_id: Optional[int] = Field(None, ge=1, description="Updated category ID")
    description: Optional[str] = Field(None, description="Updated description")
    history: Optional[str] = Field(None, description="Updated history")
    address: Optional[str] = Field(None, max_length=500, description="Updated address")
    city: Optional[str] = Field(None, max_length=120, description="Updated city")
    state: Optional[str] = Field(None, max_length=120, description="Updated state")
    country: Optional[str] = Field(None, max_length=120, description="Updated country")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Updated latitude")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Updated longitude")
    entry_fee: Optional[str] = Field(None, max_length=100, description="Updated entry fee")
    best_time_to_visit: Optional[str] = Field(None, max_length=150, description="Updated best time to visit")
    status: Optional[str] = Field(None, description="Updated publishing status")


class PlaceListItem(BaseModel):
    """Lightweight tourist place list item model for paginated search results."""
    model_config = ConfigDict(from_attributes=True)

    uuid: str = Field(..., description="Public place UUID string")
    name: str = Field(..., description="Place title")
    slug: str = Field(..., description="URL slug")
    city: Optional[str] = Field(None, description="City location")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    status: str = Field(..., description="Publishing status")
    avg_rating: float = Field(..., description="Denormalized average rating rating score")
    total_reviews: int = Field(..., description="Denormalized total reviews count")
    total_favorites: int = Field(..., description="Denormalized total favorites count")
    category: Optional[CategoryRead] = Field(None, description="Associated category summary")
    cover_image_url: Optional[str] = Field(None, description="Primary cover image URL")
    distance_km: Optional[float] = Field(None, description="Distance from requested GPS location in kilometers")
    is_favorite: bool = Field(False, description="Flag indicating if the place is favorited by the current user")


class PlaceRead(BaseModel):
    """Detailed tourist place read response model."""
    model_config = ConfigDict(from_attributes=True)

    uuid: str = Field(..., description="Public place UUID string")
    name: str = Field(..., description="Place title")
    slug: str = Field(..., description="URL slug")
    category_id: int = Field(..., description="Category integer ID")
    description: Optional[str] = Field(None, description="Detailed description")
    history: Optional[str] = Field(None, description="Historical background text")
    address: Optional[str] = Field(None, description="Physical address")
    city: Optional[str] = Field(None, description="City location")
    state: Optional[str] = Field(None, description="State / Province")
    country: Optional[str] = Field(None, description="Country name")
    latitude: float = Field(..., description="Geographic latitude coordinate")
    longitude: float = Field(..., description="Geographic longitude coordinate")
    osm_id: Optional[int] = Field(None, description="Associated OpenStreetMap ID")
    osm_type: Optional[str] = Field(None, description="Associated OpenStreetMap type")
    entry_fee: Optional[str] = Field(None, description="Entry fee info")
    best_time_to_visit: Optional[str] = Field(None, description="Recommended visiting times")
    status: str = Field(..., description="Publishing status")
    avg_rating: float = Field(..., description="Average rating score (0.00 - 5.00)")
    total_reviews: int = Field(..., description="Total review submissions count")
    total_favorites: int = Field(..., description="Total user bookmarks count")
    source: str = Field("osm", description="Data source origin (osm or admin)")
    is_favorite: bool = Field(False, description="Flag indicating if the place is favorited by the current user")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last updated timestamp")

    # Nested Relations
    category: Optional[CategoryRead] = Field(None, description="Associated category object")
    images: List[PlaceImageRead] = Field(default_factory=list, description="Place gallery images")
    timings: List[PlaceTimingRead] = Field(default_factory=list, description="Weekly operating hours")


# Backward compatibility aliases
PlaceResponse = PlaceRead
PlaceDetailResponse = PlaceRead


class PlaceFilterParams(BaseModel):
    """Query parameter filter schema for listing places."""
    category_id: Optional[int] = Field(None, ge=1, description="Filter by category ID")
    city: Optional[str] = Field(None, description="Filter by city name")
    query: Optional[str] = Field(None, description="Search term for name, description, or address")
    min_rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="Minimum average rating threshold")
    status: Optional[str] = Field("published", description="Filter by publishing status")
    page: int = Field(1, ge=1, description="Page index (1-based)")
    page_size: int = Field(20, ge=1, le=100, description="Page size limit")


class NearbySearchParams(BaseModel):
    """Query parameters for spatial radius search."""
    latitude: float = Field(..., ge=-90.0, le=90.0, description="User current latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="User current longitude coordinate")
    radius_km: float = Field(10.0, ge=0.1, le=100.0, description="Search radius in kilometers")
    limit: int = Field(20, ge=1, le=100, description="Maximum number of nearby places to return")
