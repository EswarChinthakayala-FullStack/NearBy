from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.review import Review, ReviewImage
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    """Review repository for place reviews and ratings."""

    def __init__(self, session: AsyncSession):
        super().__init__(Review, session)

    async def get_by_uuid(self, uuid_str: str) -> Optional[Review]:
        """Fetch review by public UUID."""
        result = await self.session.execute(
            select(Review)
            .options(selectinload(Review.user), selectinload(Review.images))
            .where(Review.uuid == uuid_str)
        )
        return result.scalars().first()

    async def get_by_place(self, place_id: int, status: str = "approved", skip: int = 0, limit: int = 20) -> List[Review]:
        """Fetch moderation-filtered reviews for a given place."""
        stmt = (
            select(Review)
            .options(selectinload(Review.user), selectinload(Review.images))
            .where(Review.place_id == place_id)
        )
        if status:
            stmt = stmt.where(Review.status == status)

        stmt = stmt.order_by(Review.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_user_and_place(self, user_id: int, place_id: int) -> Optional[Review]:
        """Fetch existing user review for a specific place."""
        result = await self.session.execute(
            select(Review).where(Review.user_id == user_id, Review.place_id == place_id)
        )
        return result.scalars().first()
