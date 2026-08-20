from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.place import Place
from app.models.trending import TrendingMaterialized

class TrendingService:
    """Discovery service for trending places based on recent activity."""

    async def get_trending(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        page: int = 1,
        page_size: int = 20,
        query_str: Optional[str] = None,
        category: Optional[str] = None,
        min_rating: Optional[float] = None,
        open_now: Optional[bool] = None
    ) -> List[Place]:
        stmt = (
            select(Place)
            .join(TrendingMaterialized, Place.id == TrendingMaterialized.place_id)
            .options(
                selectinload(Place.category),
                selectinload(Place.images),
                selectinload(Place.timings)
            )
            .where(Place.status == "published")
        )

        # If user coordinates are provided, pre-filter by 100km bounding box to ensure location awareness
        if latitude != 0.0 and longitude != 0.0:
            lat_delta = 0.9
            lon_delta = 1.1
            stmt = stmt.where(
                Place.latitude.between(latitude - lat_delta, latitude + lat_delta),
                Place.longitude.between(longitude - lon_delta, longitude + lon_delta)
            )

        if query_str:
            stmt = stmt.where(Place.name.ilike(f"%{query_str}%"))

        if category and category != "All":
            from app.models.category import Category
            stmt = stmt.join(Category, Place.category_id == Category.id).where(Category.name.ilike(category))

        if min_rating:
            stmt = stmt.where(Place.avg_rating >= min_rating)

        # Sort by trending score
        stmt = stmt.order_by(desc(TrendingMaterialized.trending_score))

        # Pagination
        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        res = await db.execute(stmt)
        places = list(res.scalars().all())

        # Fallback to global trending if local trending is empty
        if not places and latitude != 0.0 and longitude != 0.0:
            fallback_stmt = (
                select(Place)
                .join(TrendingMaterialized, Place.id == TrendingMaterialized.place_id)
                .options(
                    selectinload(Place.category),
                    selectinload(Place.images),
                    selectinload(Place.timings)
                )
                .where(Place.status == "published")
            )
            if query_str:
                fallback_stmt = fallback_stmt.where(Place.name.ilike(f"%{query_str}%"))
            if category and category != "All":
                from app.models.category import Category
                fallback_stmt = fallback_stmt.join(Category, Place.category_id == Category.id).where(Category.name.ilike(category))
            if min_rating:
                fallback_stmt = fallback_stmt.where(Place.avg_rating >= min_rating)

            fallback_stmt = fallback_stmt.order_by(desc(TrendingMaterialized.trending_score)).offset(offset).limit(page_size)
            res_fallback = await db.execute(fallback_stmt)
            places = list(res_fallback.scalars().all())

        return places

trending_service = TrendingService()
