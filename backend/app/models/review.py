import uuid as uuid_lib
from typing import List, Optional
from sqlalchemy import BigInteger, CheckConstraint, Enum as SQLEnum, ForeignKey, SmallInteger, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
from app.models.enums import ReviewStatus


class Review(Base, TimestampMixin):
    """User review and rating entity for tourist places."""
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="rating_range"),
        UniqueConstraint("user_id", "place_id", name="uk_reviews_user_place"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, nullable=False, default=lambda: str(uuid_lib.uuid4()), index=True)
    place_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("places.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(SQLEnum('pending', 'approved', 'rejected', name='review_status_enum'), default=ReviewStatus.PENDING.value, nullable=False, index=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="reviews")
    place: Mapped["Place"] = relationship("Place", back_populates="reviews")
    images: Mapped[List["ReviewImage"]] = relationship("ReviewImage", back_populates="review", cascade="all, delete-orphan")


# Re-export for backward compatibility
from app.models.image import ReviewImage  # noqa: F401
