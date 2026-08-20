from datetime import time
from typing import Optional
from sqlalchemy import BigInteger, Boolean, CheckConstraint, ForeignKey, SmallInteger, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class PlaceTiming(Base):
    """Place timing entity representing weekly operating hours."""
    __tablename__ = "place_timings"
    __table_args__ = (
        CheckConstraint("day_of_week BETWEEN 0 AND 6", name="day_range"),
        UniqueConstraint("place_id", "day_of_week", name="uk_place_timings_day"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    place_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("places.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    day_of_week: Mapped[int] = mapped_column(SmallInteger, nullable=False, comment="0=Sun, 1=Mon...6=Sat")
    opens_at: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    closes_at: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    place: Mapped["Place"] = relationship("Place", back_populates="timings")
