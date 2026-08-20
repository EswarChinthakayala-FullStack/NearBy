from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_admin, get_db
from app.core.exceptions import ConflictException, ResourceNotFoundException
from app.crud.crud_category import crud_category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.schemas.common import ResponseModel

router = APIRouter()


@router.get(
    "",
    response_model=ResponseModel[List[CategoryRead]],
    summary="List all categories",
    description="Retrieve all tourist place categories sorted alphabetically."
)
async def list_categories(
    db: AsyncSession = Depends(get_db)
):
    categories = await crud_category.get_all(db)
    items = [CategoryRead.model_validate(c) for c in categories]
    return ResponseModel[List[CategoryRead]](
        success=True,
        message="Categories retrieved successfully.",
        data=items
    )


@router.get(
    "/{slug}",
    response_model=ResponseModel[CategoryRead],
    summary="Get category by slug",
    description="Retrieve single category by URL slug."
)
async def get_category_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    category = await crud_category.get_by_slug(db, slug=slug)
    if not category:
        raise ResourceNotFoundException("Category", slug)

    return ResponseModel[CategoryRead](
        success=True,
        message="Category retrieved successfully.",
        data=CategoryRead.model_validate(category)
    )


@router.post(
    "",
    response_model=ResponseModel[CategoryRead],
    status_code=status.HTTP_201_CREATED,
    summary="Create category (Admin only)",
    description="Create a new tourist category."
)
async def create_category(
    cat_in: CategoryCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    existing = await crud_category.get_by_name(db, name=cat_in.name)
    if existing:
        raise ConflictException("Category", "name", cat_in.name)

    category = await crud_category.create(db, obj_in=cat_in)
    return ResponseModel[CategoryRead](
        success=True,
        message="Category created successfully.",
        data=CategoryRead.model_validate(category)
    )


@router.patch(
    "/{id}",
    response_model=ResponseModel[CategoryRead],
    summary="Update category (Admin only)",
    description="Update existing category details."
)
async def update_category(
    id: int,
    cat_in: CategoryUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    category = await crud_category.get(db, id=id)
    if not category:
        raise ResourceNotFoundException("Category", id)

    updated = await crud_category.update(db, db_obj=category, obj_in=cat_in)
    return ResponseModel[CategoryRead](
        success=True,
        message="Category updated successfully.",
        data=CategoryRead.model_validate(updated)
    )


@router.delete(
    "/{id}",
    response_model=ResponseModel[dict],
    summary="Delete category (Admin only)",
    description="Delete a category by integer ID."
)
async def delete_category(
    id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    category = await crud_category.get(db, id=id)
    if not category:
        raise ResourceNotFoundException("Category", id)

    await crud_category.remove(db, id=id)
    return ResponseModel[dict](
        success=True,
        message="Category deleted successfully.",
        data={}
    )
