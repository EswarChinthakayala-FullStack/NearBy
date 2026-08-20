from sqlalchemy import BigInteger, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class TrendingMaterialized(Base):
    """Materialized table holding precomputed trending scores for high-performance sorting."""
    __tablename__ = "trending_places_materialized"

    place_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    trending_score: Mapped[float] = mapped_column(Float, nullable=False, index=True)
