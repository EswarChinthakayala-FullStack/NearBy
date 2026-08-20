from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.place import Place
from app.core.cache import cache_manager

class PopularityService:
    """Discovery service for globally popular destinations."""

    async def get_popular(
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
        cache_key = f"popular:list:q={query_str or ''}:cat={category or ''}:rating={min_rating or 0}:page={page}"
        cached_ids = await cache_manager.get(cache_key)

        if cached_ids:
            # Resolve Place objects by IDs in the exact cached order
            stmt = (
                select(Place)
                .options(
                    selectinload(Place.category),
                    selectinload(Place.images),
                    selectinload(Place.timings)
                )
                .where(Place.id.in_(cached_ids))
            )
            res = await db.execute(stmt)
            places = {p.id: p for p in res.scalars().all()}
            return [places[pid] for pid in cached_ids if pid in places]

        # Cache miss: compute popular score
        score_expr = (
            Place.total_reviews * 0.25 +
            Place.avg_rating * 5.0 * 0.25 +
            Place.total_favorites * 0.20 +
            (Place.id % 7) * 0.15 +     # simulated trips
            (Place.id % 23) * 0.10 +    # simulated page views
            (Place.id % 3 == 0) * 0.05  # simulated editor's boost
        )

        stmt = (
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.images),
                selectinload(Place.timings)
            )
            .where(Place.status == "published")
            .order_by(desc(score_expr))
        )

        if query_str:
            stmt = stmt.where(Place.name.ilike(f"%{query_str}%"))

        if category and category != "All":
            from app.models.category import Category
            stmt = stmt.join(Category, Place.category_id == Category.id).where(Category.name.ilike(category))

        if min_rating:
            stmt = stmt.where(Place.avg_rating >= min_rating)

        # Pagination
        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        res = await db.execute(stmt)
        places_list = list(res.scalars().all())

        # Save to cache for 30 mins
        pids = [p.id for p in places_list]
        await cache_manager.set(cache_key, pids, ttl=1800)

        return places_list

popularity_service = PopularityService()
