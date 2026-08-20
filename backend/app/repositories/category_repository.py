from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    """Category repository for database operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(Category, session)

    async def get_by_slug(self, slug: str) -> Optional[Category]:
        """Fetch category by unique URL slug."""
        result = await self.session.execute(
            select(Category).where(Category.slug == slug)
        )
        return result.scalars().first()

    async def get_by_name(self, name: str) -> Optional[Category]:
        """Fetch category by unique display name."""
        result = await self.session.execute(
            select(Category).where(Category.name == name)
        )
        return result.scalars().first()
