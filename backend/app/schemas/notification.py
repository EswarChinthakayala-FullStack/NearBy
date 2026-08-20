from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class NotificationRead(BaseModel):
    """Notification response schema."""
    model_config = ConfigDict(from_attributes=True)

    uuid: str = Field(..., description="Unique notification UUID")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification body text")
    type: str = Field("system", description="Notification category: travel, review, favorite, suggestion, system")
    is_read: bool = Field(False, description="Read state flag")
    link_url: Optional[str] = Field(None, description="Optional navigation URL link")
    created_at: datetime = Field(..., description="Creation timestamp")


class NotificationCreate(BaseModel):
    """Notification payload creation schema."""
    title: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=2)
    type: Optional[str] = Field("system")
    link_url: Optional[str] = Field(None)
    user_id: Optional[int] = Field(None)
