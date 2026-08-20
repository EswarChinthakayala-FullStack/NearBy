import uuid as uuid_lib
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import BigInteger, DECIMAL, Enum as SQLEnum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
from app.models.enums import PlaceSource, PlaceStatus


class Place(Base, TimestampMixin):
    """Tourist place entity representing physical locations, monuments, and attractions."""
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, nullable=False, default=lambda: str(uuid_lib.uuid4()), index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    history: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(120), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    latitude: Mapped[Decimal] = mapped_column(DECIMAL(10, 7), nullable=False, index=True)
    longitude: Mapped[Decimal] = mapped_column(DECIMAL(10, 7), nullable=False, index=True)
    osm_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True, index=True)
    osm_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    entry_fee: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    best_time_to_visit: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    status: Mapped[str] = mapped_column(SQLEnum('draft', 'published', 'archived', name='place_status_enum'), default=PlaceStatus.DRAFT.value, nullable=False, index=True)
    avg_rating: Mapped[Decimal] = mapped_column(DECIMAL(3, 2), default=Decimal('0.00'), nullable=False, index=True)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_favorites: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    source: Mapped[str] = mapped_column(SQLEnum('osm', 'admin', name='place_source_enum'), default=PlaceSource.OSM.value, nullable=False)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)

    # Relationships
    category: Mapped["Category"] = relationship("Category", back_populates="places")
    creator: Mapped[Optional["User"]] = relationship("User", back_populates="created_places")
    timings: Mapped[List["PlaceTiming"]] = relationship("PlaceTiming", back_populates="place", cascade="all, delete-orphan")
    images: Mapped[List["PlaceImage"]] = relationship("PlaceImage", back_populates="place", cascade="all, delete-orphan")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="place", cascade="all, delete-orphan")
    favorites: Mapped[List["Favorite"]] = relationship("Favorite", back_populates="place", cascade="all, delete-orphan")
    sync_logs: Mapped[List["ContentSyncLog"]] = relationship("ContentSyncLog", back_populates="place", cascade="all, delete-orphan")

    @property
    def rating(self) -> float:
        return float(self.avg_rating) if self.avg_rating is not None else 0.0

    @property
    def cover_image(self) -> Optional[str]:
        if not self.images:
            return None
        for img in self.images:
            if getattr(img, "is_cover", False):
                return img.image_url
        return self.images[0].image_url if self.images else None


# Composite indexes matching schema.sql
Index("idx_places_city_category", Place.city, Place.category_id)
Index("idx_places_coords", Place.latitude, Place.longitude)
Index("idx_places_status_rating", Place.status, Place.avg_rating)

# Re-exports for backward compatibility
from app.models.timing import PlaceTiming  # noqa: F401
from app.models.image import PlaceImage  # noqa: F401

