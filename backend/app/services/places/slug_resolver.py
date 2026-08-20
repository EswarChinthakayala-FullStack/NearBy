import logging
from typing import Optional, Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.place import Place
from app.core.cache import cache_manager

logger = logging.getLogger(__name__)

class SlugResolverService:
    """Service to resolve place details using unique SEO-friendly place_slug with Redis caching."""

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Place]:
        cache_key = f"place_slug:{slug}"

        # 1. Query database using indexed slug column
        stmt = (
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.images),
                selectinload(Place.timings),
                selectinload(Place.reviews)
            )
            .where(Place.slug == slug.strip().lower())
        )
        result = await db.execute(stmt)
        place = result.scalars().first()

        return place

slug_resolver = SlugResolverService()
