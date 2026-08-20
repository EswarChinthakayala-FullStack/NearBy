from typing import Any, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.crud.base import CRUDBase
from app.models.favorite import Favorite
from app.models.place import Place
from app.schemas.favorite import FavoriteCreate


class CRUDFavorite(CRUDBase[Favorite, FavoriteCreate, Any]):
    """Favorite bookmark repository with atomic place counter synchronization."""

    async def is_favorited(self, db: AsyncSession, user_id: int, place_id: int) -> bool:
        """Check if a user has bookmarked a place."""
        stmt = (
            select(Favorite)
            .where(Favorite.user_id == user_id)
            .where(Favorite.place_id == place_id)
        )
        res = await db.execute(stmt)
        return res.scalars().first() is not None

    async def toggle_favorite(
        self,
        db: AsyncSession,
        user_id: int,
        place_id: int
    ) -> Tuple[bool, int]:
        """Atomically toggle place bookmark and update Place.total_favorites counter."""
        stmt = (
            select(Favorite)
            .where(Favorite.user_id == user_id)
            .where(Favorite.place_id == place_id)
        )
        res = await db.execute(stmt)
        favorite = res.scalars().first()

        place_stmt = select(Place).where(Place.id == place_id)
        place_res = await db.execute(place_stmt)
        place = place_res.scalars().first()

        if not place:
            raise ValueError(f"Place with ID {place_id} does not exist.")

        if favorite:
            # Remove bookmark
            await db.delete(favorite)
            place.total_favorites = max(0, place.total_favorites - 1)
            is_fav = False
        else:
            # Add bookmark
            new_fav = Favorite(user_id=user_id, place_id=place_id)
            db.add(new_fav)
            place.total_favorites += 1
            is_fav = True

        db.add(place)
        await db.commit()
        await db.refresh(place)
        return is_fav, place.total_favorites

    async def get_user_favorites(
        self,
        db: AsyncSession,
        user_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> List[Favorite]:
        """Fetch user bookmarked places array with eager loaded place data."""
        stmt = (
            select(Favorite)
            .options(
                selectinload(Favorite.place).selectinload(Place.category),
                selectinload(Favorite.place).selectinload(Place.images)
            )
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def get_user_favorites_count(self, db: AsyncSession, user_id: int) -> int:
        """Get total count of user favorite bookmarks."""
        from sqlalchemy import func
        stmt = select(func.count(Favorite.id)).where(Favorite.user_id == user_id)
        res = await db.execute(stmt)
        return res.scalar_one() or 0


crud_favorite = CRUDFavorite(Favorite)
