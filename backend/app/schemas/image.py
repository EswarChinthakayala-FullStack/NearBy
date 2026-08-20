from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class PlaceImageCreate(BaseModel):
    """Place image upload/link creation payload."""
    image_url: str = Field(..., max_length=500, description="Full image URL")
    thumbnail_url: Optional[str] = Field(None, max_length=500, description="Optional thumbnail image URL")
    source: Optional[str] = Field("admin", description="Image source origin (wikimedia, bing, admin, user)")
    is_cover: Optional[bool] = Field(False, description="Set as primary cover image for place")
    sort_order: Optional[int] = Field(0, description="Gallery ordering index position")


class PlaceImageRead(BaseModel):
    """Place image read response payload."""
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Image identifier")
    image_url: str = Field(..., description="Full image URL")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail image URL")
    source: str = Field(..., description="Image source origin")
    is_cover: bool = Field(..., description="Primary cover image flag")
    sort_order: int = Field(..., description="Gallery sort order")
    created_at: datetime = Field(..., description="Upload timestamp")


class ReviewImageRead(BaseModel):
    """Review attachment image read response payload."""
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Review image attachment identifier")
    image_url: str = Field(..., description="Attachment image URL")
    created_at: datetime = Field(..., description="Upload timestamp")


class ImageUploadResponse(BaseModel):
    """File upload operation response payload."""
    image_url: str = Field(..., description="Uploaded image access URL")
    thumbnail_url: Optional[str] = Field(None, description="Generated thumbnail image URL")
    filename: str = Field(..., description="Original uploaded filename")
    file_size_bytes: int = Field(..., description="Uploaded file size in bytes")
    mime_type: str = Field(..., description="Detected MIME content type")
