from datetime import datetime
from sqlalchemy import BigInteger, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Favorite(Base):
    """User bookmark / favorite place entity."""
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "place_id", name="uk_favorites_user_place"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    place_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("places.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="favorites")
    place: Mapped["Place"] = relationship("Place", back_populates="favorites")
