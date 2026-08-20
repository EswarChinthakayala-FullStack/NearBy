import uuid as uuid_lib
from datetime import datetime
from typing import Optional, Any
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class SavedItinerary(Base, TimestampMixin):
    """Saved travel itinerary entity created by AI Planner."""
    __tablename__ = "saved_itineraries"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, nullable=False, default=lambda: str(uuid_lib.uuid4()), index=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destination: Mapped[str] = mapped_column(String(191), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    travel_dates: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    budget: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    itinerary_data: Mapped[Any] = mapped_column(JSON, nullable=False)
    reasoning_data: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    route_data: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    # Relationship
    user: Mapped["User"] = relationship("User", backref="saved_itineraries")
