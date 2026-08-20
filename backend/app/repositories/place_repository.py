from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.place import Place, PlaceTiming, PlaceImage
from app.repositories.base import BaseRepository


class PlaceRepository(BaseRepository[Place]):
    """Place repository handling places directory and spatial queries."""

    def __init__(self, session: AsyncSession):
        super().__init__(Place, session)

    async def get_by_uuid(self, uuid_str: str) -> Optional[Place]:
        """Fetch place by public UUID with relationships preloaded."""
        result = await self.session.execute(
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.timings),
                selectinload(Place.images)
            )
            .where(Place.uuid == uuid_str)
        )
        return result.scalars().first()

    async def get_by_slug(self, slug: str) -> Optional[Place]:
        """Fetch place by URL slug with preloaded relationships."""
        result = await self.session.execute(
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.timings),
                selectinload(Place.images)
            )
            .where(Place.slug == slug)
        )
        return result.scalars().first()

    async def search_places(
        self,
        query: Optional[str] = None,
        category_id: Optional[int] = None,
        city: Optional[str] = None,
        status: str = "published",
        skip: int = 0,
        limit: int = 20
    ) -> List[Place]:
        """Search and filter published tourist places."""
        stmt = select(Place).options(
            selectinload(Place.category),
            selectinload(Place.images)
        )

        if status:
            stmt = stmt.where(Place.status == status)

        if category_id:
            stmt = stmt.where(Place.category_id == category_id)

        if city:
            stmt = stmt.where(func.lower(Place.city) == city.lower())

        if query:
            search_pattern = f"%{query}%"
            stmt = stmt.where(
                (Place.name.ilike(search_pattern)) |
                (Place.description.ilike(search_pattern)) |
                (Place.address.ilike(search_pattern))
            )

        stmt = stmt.order_by(Place.avg_rating.desc(), Place.total_reviews.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 10.0,
        limit: int = 20
    ) -> List[Place]:
        """Spatial query returning places within radius_km using Haversine formula calculation."""
        # Distance calculation in kilometers: 6371 * acos(...)
        distance_expr = (
            6371 * func.acos(
                func.cos(func.radians(latitude)) *
                func.cos(func.radians(Place.latitude)) *
                func.cos(func.radians(Place.longitude) - func.radians(longitude)) +
                func.sin(func.radians(latitude)) *
                func.sin(func.radians(Place.latitude))
            )
        )

        stmt = (
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.images)
            )
            .where(Place.status == "published")
            .where(distance_expr <= radius_km)
            .order_by(distance_expr)
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())
