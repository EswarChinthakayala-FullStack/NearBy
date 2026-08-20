from datetime import datetime
from typing import Optional
from sqlalchemy import BigInteger, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from app.models.enums import ImageSource


class PlaceImage(Base):
    """Place image metadata entity for tourist place galleries."""
    __tablename__ = "place_images"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    place_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("places.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    source: Mapped[str] = mapped_column(SQLEnum('wikimedia', 'bing', 'admin', 'user', name='image_source_enum'), default=ImageSource.ADMIN.value, nullable=False)
    uploaded_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    # Relationships
    place: Mapped["Place"] = relationship("Place", back_populates="images")
    uploader: Mapped[Optional["User"]] = relationship("User", back_populates="uploaded_images")


class ReviewImage(Base):
    """Review image attachment entity."""
    __tablename__ = "review_images"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    review_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("reviews.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    # Relationships
    review: Mapped["Review"] = relationship("Review", back_populates="images")
