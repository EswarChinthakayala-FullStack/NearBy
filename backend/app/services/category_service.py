import re
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import DuplicateEntityException, EntityNotFoundException
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate


class CategoryService:
    """Category business management service."""

    def __init__(self, session: AsyncSession):
        self.category_repo = CategoryRepository(session)

    def _generate_slug(self, name: str) -> str:
        """Helper generating clean URL slug from name."""
        slug = name.lower().strip()
        slug = re.sub(r'[^\w\s-]', '', slug)
        return re.sub(r'[\s_-]+', '-', slug)

    async def get_all_categories(self, skip: int = 0, limit: int = 100) -> List[CategoryResponse]:
        """List all place categories."""
        categories = await self.category_repo.get_all(skip=skip, limit=limit)
        return [CategoryResponse.model_validate(c) for c in categories]

    async def get_by_slug(self, slug: str) -> CategoryResponse:
        """Get category details by slug."""
        category = await self.category_repo.get_by_slug(slug)
        if not category:
            raise EntityNotFoundException("Category", slug)
        return CategoryResponse.model_validate(category)

    async def create_category(self, cat_in: CategoryCreate) -> CategoryResponse:
        """Create new category with generated slug."""
        existing = await self.category_repo.get_by_name(cat_in.name)
        if existing:
            raise DuplicateEntityException("Category", "name", cat_in.name)

        data = cat_in.model_dump()
        data["slug"] = self._generate_slug(cat_in.name)

        category = await self.category_repo.create(data)
        return CategoryResponse.model_validate(category)

    async def update_category(self, category_id: int, cat_in: CategoryUpdate) -> CategoryResponse:
        """Update category parameters."""
        category = await self.category_repo.get_by_id(category_id)
        if not category:
            raise EntityNotFoundException("Category", category_id)

        data = cat_in.model_dump(exclude_unset=True)
        if "name" in data and data["name"]:
            data["slug"] = self._generate_slug(data["name"])

        updated = await self.category_repo.update(category, data)
        return CategoryResponse.model_validate(updated)
