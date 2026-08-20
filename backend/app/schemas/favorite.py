from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.place import PlaceListItem


class FavoriteCreate(BaseModel):
    """Bookmark favorite place request payload."""
    place_uuid: str = Field(..., description="Target place public UUID string")


class FavoriteRead(BaseModel):
    """User favorite place item read response payload."""
    model_config = ConfigDict(from_attributes=True)

    created_at: datetime = Field(..., description="Bookmarked timestamp")
    place: Optional[PlaceListItem] = Field(None, description="Bookmarked place summary info")


# Backward compatibility alias
FavoriteResponse = FavoriteRead


class FavoriteToggleResponse(BaseModel):
    """Favorite toggle operation response payload."""
    is_favorited: bool = Field(..., description="True if place is now bookmarked, False if removed")
    message: str = Field(..., description="Status feedback message")
    total_favorites: int = Field(..., description="Updated total favorites count for place")
