from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any, Dict, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging_config import logger
from app.models.sync_log import RoutingCache
from app.services.external.routing import RoutingClient
from app.services.geo_service import validate_coordinates


class RoutingService:
    """Multi-provider routing service with DB cache lookup and persistence."""

    def __init__(self):
        self.client = RoutingClient()

    async def get_directions(
        self,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        provider: str = "osrm",
        db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """Calculate route distance, duration, and geometry with DB cache lookup."""
        validate_coordinates(origin_lat, origin_lng)
        validate_coordinates(dest_lat, dest_lng)

        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # 1. Check DB cache if session provided
        if db:
            cache_stmt = (
                select(RoutingCache)
                .where(RoutingCache.origin_lat == Decimal(str(origin_lat)))
                .where(RoutingCache.origin_lng == Decimal(str(origin_lng)))
                .where(RoutingCache.dest_lat == Decimal(str(dest_lat)))
                .where(RoutingCache.dest_lng == Decimal(str(dest_lng)))
                .where(RoutingCache.expires_at > now)
            )
            res = await db.execute(cache_stmt)
            cached_route = res.scalars().first()

            if cached_route:
                logger.info("Routing cache hit: returning cached route geometry.")
                return {
                    "found": True,
                    "distance_meters": cached_route.distance_meters,
                    "duration_seconds": cached_route.duration_seconds,
                    "geometry": cached_route.geometry_json,
                    "provider": cached_route.provider,
                    "cached": True
                }

        # 2. Cache Miss: Execute external routing request
        route_result = await self.client.get_route(
            origin_lat=origin_lat,
            origin_lng=origin_lng,
            dest_lat=dest_lat,
            dest_lng=dest_lng
        )

        distance = route_result.get("distance_meters", 0)
        duration = route_result.get("duration_seconds", 0)
        geometry = route_result.get("geometry", "")

        # 3. Store result in routing_cache if DB session available
        if db and route_result.get("found"):
            expires_at = now + timedelta(hours=24)
            cache_obj = RoutingCache(
                origin_lat=Decimal(str(origin_lat)),
                origin_lng=Decimal(str(origin_lng)),
                dest_lat=Decimal(str(dest_lat)),
                dest_lng=Decimal(str(dest_lng)),
                provider=provider,
                distance_meters=distance,
                duration_seconds=duration,
                geometry_json=str(geometry) if geometry else None,
                expires_at=expires_at
            )
            db.add(cache_obj)
            await db.commit()
            logger.info("Persisted new routing result to DB routing_cache table.")

        return {
            "found": route_result.get("found", True),
            "distance_meters": distance,
            "duration_seconds": duration,
            "geometry": geometry,
            "provider": provider,
            "cached": False
        }


routing_service = RoutingService()
