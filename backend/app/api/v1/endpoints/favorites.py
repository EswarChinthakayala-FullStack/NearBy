from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_active_user, get_db
from app.core.exceptions import ResourceNotFoundException
from app.crud.crud_favorite import crud_favorite
from app.crud.crud_place import crud_place
from app.models.user import User
from app.schemas.common import PaginatedResponse, PaginationMeta, ResponseModel
from app.schemas.favorite import FavoriteRead, FavoriteToggleResponse
from app.schemas.place import PlaceListItem
from app.utils.image_helpers import get_place_cover_image

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[FavoriteRead],
    summary="List user favorite bookmarks",
    description="Retrieve paginated list of bookmarked tourist places for current user."
)
async def list_user_favorites(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size limit"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * page_size
    favorites = await crud_favorite.get_user_favorites(db, user_id=current_user.id, skip=skip, limit=page_size)

    items = []
    for f in favorites:
        p = f.place
        if p:
            cover_url = get_place_cover_image(p)
            place_item = PlaceListItem(
                uuid=p.uuid,
                name=p.name,
                slug=p.slug,
                city=p.city,
                latitude=float(p.latitude),
                longitude=float(p.longitude),
                status=p.status,
                avg_rating=float(p.avg_rating),
                total_reviews=p.total_reviews,
                total_favorites=p.total_favorites,
                category=p.category,
                cover_image_url=cover_url
            )
            items.append(FavoriteRead(created_at=f.created_at, place=place_item))

    total = await crud_favorite.get_user_favorites_count(db, user_id=current_user.id)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse[FavoriteRead](
        success=True,
        message="User favorites retrieved successfully.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.post(
    "/{place_uuid}/toggle",
    response_model=ResponseModel[FavoriteToggleResponse],
    summary="Toggle favorite place bookmark",
    description="Add or remove a place from user bookmarks and return updated totals."
)
async def toggle_favorite_place(
    place_uuid: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_uuid(db, uuid=place_uuid)
    if not place:
        place = await crud_place.get_by_slug(db, slug=place_uuid)
    if not place:
        place = await crud_place.get_by_fuzzy_slug(db, identifier=place_uuid)
    if not place:
        raise ResourceNotFoundException("Place", place_uuid)

    is_fav, updated_total = await crud_favorite.toggle_favorite(
        db,
        user_id=current_user.id,
        place_id=place.id
    )

    msg = "Place added to favorites." if is_fav else "Place removed from favorites."

    return ResponseModel[FavoriteToggleResponse](
        success=True,
        message=msg,
        data=FavoriteToggleResponse(
            is_favorited=is_fav,
            message=msg,
            total_favorites=updated_total
        )
    )


@router.delete(
    "/{place_uuid}",
    response_model=ResponseModel[dict],
    summary="Remove favorite bookmark",
    description="Remove a place from user bookmarks."
)
async def remove_favorite_place(
    place_uuid: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_uuid(db, uuid=place_uuid)
    if not place:
        place = await crud_place.get_by_slug(db, slug=place_uuid)
    if not place:
        place = await crud_place.get_by_fuzzy_slug(db, identifier=place_uuid)
    if not place:
        raise ResourceNotFoundException("Place", place_uuid)

    if await crud_favorite.is_favorited(db, user_id=current_user.id, place_id=place.id):
        await crud_favorite.toggle_favorite(db, user_id=current_user.id, place_id=place.id)

    return ResponseModel[dict](
        success=True,
        message="Favorite bookmark removed successfully.",
        data={}
    )
