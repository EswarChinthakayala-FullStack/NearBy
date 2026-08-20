import math
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.place import Place

class NearbyAttractionsService:
    """Discovery service for nearby attractions with dynamic radius expansion."""

    async def get_nearby(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        page: int = 1,
        page_size: int = 20,
        query_str: Optional[str] = None,
        category: Optional[str] = None,
        min_rating: Optional[float] = None,
        open_now: Optional[bool] = None,
        radius_km: Optional[float] = None
    ) -> List[Place]:
        if latitude == 0.0 and longitude == 0.0:
            # Default fallback coordinates (e.g. Tallur area)
            latitude, longitude = 15.733776, 79.8799903

        # SQL distance expression
        distance_expr = (
            6371 * func.acos(
                func.least(1.0,
                    func.cos(func.radians(latitude)) *
                    func.cos(func.radians(Place.latitude)) *
                    func.cos(func.radians(Place.longitude) - func.radians(longitude)) +
                    func.sin(func.radians(latitude)) *
                    func.sin(func.radians(Place.latitude))
                )
            )
        )

        base_stmt = (
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.images),
                selectinload(Place.timings)
            )
            .where(Place.status == "published")
        )

        if query_str:
            base_stmt = base_stmt.where(Place.name.ilike(f"%{query_str}%"))

        if category and category != "All":
            from app.models.category import Category
            base_stmt = base_stmt.join(Category, Place.category_id == Category.id).where(Category.name.ilike(category))

        if min_rating:
            base_stmt = base_stmt.where(Place.avg_rating >= min_rating)

        # Dynamic radius increments
        radii = [5.0, 10.0, 25.0, 50.0] if radius_km is None else [radius_km]
        
        places_list = []
        for r in radii:
            # Bounding box pre-filtering to utilize composite coordinate index
            lat_delta = r / 111.0
            lon_delta = r / (111.0 * math.cos(math.radians(latitude))) if latitude != 0.0 else r / 111.0
            
            stmt = base_stmt.where(
                Place.latitude.between(latitude - lat_delta, latitude + lat_delta),
                Place.longitude.between(longitude - lon_delta, longitude + lon_delta)
            )
            stmt = stmt.where(distance_expr <= r).order_by(distance_expr)
            
            # Pagination
            offset = (page - 1) * page_size
            stmt = stmt.offset(offset).limit(page_size)
            
            res = await db.execute(stmt)
            places_list = list(res.scalars().all())
            
            if len(places_list) >= 5 or r == radii[-1]:
                break

        return places_list

nearby_attractions_service = NearbyAttractionsService()
