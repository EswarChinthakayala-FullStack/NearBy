from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional
from sqlalchemy import BigInteger, DECIMAL, DateTime, Enum as SQLEnum, ForeignKey, Index, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from app.models.enums import ContentSyncStatus, ContentSyncType, OsmSyncStatus


class OsmSyncLog(Base):
    """OpenStreetMap import job execution log entity."""
    __tablename__ = "osm_sync_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    sync_type: Mapped[str] = mapped_column(String(50), nullable=False)
    region: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    status: Mapped[str] = mapped_column(SQLEnum('running', 'success', 'failed', name='osm_sync_status_enum'), default=OsmSyncStatus.RUNNING.value, nullable=False, index=True)
    total_fetched: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_imported: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_skipped: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ContentSyncLog(Base):
    """Per-place external content enrichment synchronization log entity."""
    __tablename__ = "content_sync_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    place_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("places.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    sync_type: Mapped[str] = mapped_column(SQLEnum('wikipedia', 'wikimedia_image', 'bing_image', name='content_sync_type_enum'), nullable=False)
    status: Mapped[str] = mapped_column(SQLEnum('success', 'failed', name='content_sync_status_enum'), nullable=False, index=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    # Relationships
    place: Mapped["Place"] = relationship("Place", back_populates="sync_logs")


class RoutingCache(Base):
    """Cached routing calculation results between origin and destination points."""
    __tablename__ = "routing_cache"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    origin_lat: Mapped[Decimal] = mapped_column(DECIMAL(10, 7), nullable=False)
    origin_lng: Mapped[Decimal] = mapped_column(DECIMAL(10, 7), nullable=False)
    dest_lat: Mapped[Decimal] = mapped_column(DECIMAL(10, 7), nullable=False)
    dest_lng: Mapped[Decimal] = mapped_column(DECIMAL(10, 7), nullable=False)
    provider: Mapped[str] = mapped_column(String(30), nullable=False)
    distance_meters: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    geometry_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)


# Index on routing cache coordinate pairs
Index("idx_routing_coords", RoutingCache.origin_lat, RoutingCache.origin_lng, RoutingCache.dest_lat, RoutingCache.dest_lng)


class AdminActivityLog(Base):
    """Administrator activity audit logging entity."""
    __tablename__ = "admin_activity_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    admin_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    entity_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    meta_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.current_timestamp(), nullable=False)

    # Relationships
    admin: Mapped["User"] = relationship("User", back_populates="activity_logs")
