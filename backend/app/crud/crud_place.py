from typing import List, Optional, Tuple
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.crud.base import CRUDBase
from app.models.place import Place
from app.schemas.place import PlaceCreate, PlaceFilterParams, PlaceUpdate


class CRUDPlace(CRUDBase[Place, PlaceCreate, PlaceUpdate]):
    """Tourist place repository managing place queries, spatial nearby search, and filters."""

    async def get_by_uuid(self, db: AsyncSession, uuid: str) -> Optional[Place]:
        """Fetch place by public UUID (or slug fallback) with eager loaded relationships."""
        clean_val = uuid.strip()
        conditions = [Place.uuid == clean_val, func.lower(Place.slug) == clean_val.lower()]
        if clean_val.isdigit():
            conditions.append(Place.id == int(clean_val))
        stmt = (
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.images),
                selectinload(Place.timings)
            )
            .where(or_(*conditions))
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Place]:
        """Fetch place by URL slug (or UUID/ID fallback) with eager loaded relationships."""
        clean_val = slug.strip()
        conditions = [func.lower(Place.slug) == clean_val.lower(), Place.uuid == clean_val]
        if clean_val.isdigit():
            conditions.append(Place.id == int(clean_val))
        stmt = (
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.images),
                selectinload(Place.timings)
            )
            .where(or_(*conditions))
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_fuzzy_slug(self, db: AsyncSession, identifier: str) -> Optional[Place]:
        """Fetch place by fuzzy partial slug or name matching to avoid 404s on minor slug variations."""
        clean_val = identifier.strip().lower()
        search_terms = clean_val.replace("-", " ").replace("_", " ")
        term_parts = search_terms.split()

        conditions = [
            Place.slug.ilike(f"%{clean_val}%"),
            Place.name.ilike(f"%{search_terms}%")
        ]
        if term_parts:
            conditions.append(Place.name.ilike(f"%{term_parts[0]}%"))

        stmt = (
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.images),
                selectinload(Place.timings)
            )
            .where(or_(*conditions))
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def filter_places(
        self,
        db: AsyncSession,
        filters: PlaceFilterParams
    ) -> Tuple[List[Place], int]:
        """Filter places by category, city, search term, min_rating, and status with pagination."""
        stmt = select(Place).options(selectinload(Place.category), selectinload(Place.images))

        if filters.status:
            stmt = stmt.where(Place.status == filters.status)

        if filters.category_id:
            stmt = stmt.where(Place.category_id == filters.category_id)

        if filters.city:
            stmt = stmt.where(func.lower(Place.city) == filters.city.lower().strip())

        if filters.min_rating is not None:
            stmt = stmt.where(Place.avg_rating >= filters.min_rating)

        if filters.query:
            pattern = f"%{filters.query.strip()}%"
            stmt = stmt.where(
                (Place.name.ilike(pattern)) |
                (Place.description.ilike(pattern)) |
                (Place.address.ilike(pattern))
            )

        # Count query
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one() or 0

        # Pagination & Ordering
        page = max(1, filters.page)
        page_size = max(1, filters.page_size)
        skip = (page - 1) * page_size

        stmt = stmt.order_by(Place.avg_rating.desc(), Place.total_reviews.desc()).offset(skip).limit(page_size)
        result = await db.execute(stmt)
        return list(result.scalars().all()), total

    async def find_nearby(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        radius_km: float = 10.0,
        limit: int = 20
    ) -> List[Place]:
        """Spatial nearby search within radius_km using Haversine distance formula."""
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

        result = await db.execute(stmt)
        return list(result.scalars().all())


crud_place = CRUDPlace(Place)
