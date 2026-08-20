from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CRUDCategory(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    """Category repository for tourist place classifications."""

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Category]:
        """Fetch category by URL slug."""
        stmt = select(Category).where(func.lower(Category.slug) == slug.lower().strip())
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Category]:
        """Fetch category by name."""
        stmt = select(Category).where(func.lower(Category.name) == name.lower().strip())
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_all(self, db: AsyncSession) -> List[Category]:
        """Fetch all categories ordered alphabetically by name."""
        stmt = select(Category).order_by(Category.name.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())


crud_category = CRUDCategory(Category)
