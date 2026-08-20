from typing import List, Optional
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.favorite import Favorite
from app.repositories.base import BaseRepository


class FavoriteRepository(BaseRepository[Favorite]):
    """Favorite repository for managing user bookmarks."""

    def __init__(self, session: AsyncSession):
        super().__init__(Favorite, session)

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 20) -> List[Favorite]:
        """Fetch user bookmarked places with preloaded place details."""
        result = await self.session.execute(
            select(Favorite)
            .options(
                selectinload(Favorite.place).selectinload(Favorite.place.category),
                selectinload(Favorite.place).selectinload(Favorite.place.images)
            )
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_user_and_place(self, user_id: int, place_id: int) -> Optional[Favorite]:
        """Fetch existing favorite record for a user and place."""
        result = await self.session.execute(
            select(Favorite).where(Favorite.user_id == user_id, Favorite.place_id == place_id)
        )
        return result.scalars().first()

    async def delete_by_user_and_place(self, user_id: int, place_id: int) -> bool:
        """Remove bookmark for user and place."""
        result = await self.session.execute(
            delete(Favorite).where(Favorite.user_id == user_id, Favorite.place_id == place_id)
        )
        return result.rowcount > 0
