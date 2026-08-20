from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_active_user, get_current_admin, get_db
from app.core.exceptions import ConflictException, ResourceNotFoundException
from app.crud.crud_place import crud_place
from app.crud.crud_review import crud_review
from app.models.user import User
from app.schemas.common import PaginatedResponse, PaginationMeta, ResponseModel
from app.schemas.review import PlaceReviewSummary, ReviewCreate, ReviewModerate, ReviewRead, ReviewUpdate

router = APIRouter()


@router.get(
    "/me",
    response_model=PaginatedResponse[ReviewRead],
    summary="List authenticated user reviews",
    description="Retrieve all reviews submitted by current logged-in user."
)
async def list_my_reviews(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size limit"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * page_size
    reviews = await crud_review.get_user_reviews(db, user_id=current_user.id, skip=skip, limit=page_size)
    total = await crud_review.get_user_reviews_count(db, user_id=current_user.id)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    items = []
    for r in reviews:
        item = ReviewRead.model_validate(r)
        if r.place:
            cov = None
            if hasattr(r.place, "images") and r.place.images:
                cov = r.place.images[0].image_url
            cat_name = r.place.category.name if hasattr(r.place, "category") and r.place.category else None
            item.place = PlaceReviewSummary(
                uuid=r.place.uuid,
                slug=r.place.slug or r.place.uuid,
                name=r.place.name,
                category=cat_name,
                city=r.place.city,
                district=r.place.city,
                state=r.place.state,
                country=r.place.country,
                cover_image=cov,
                rating=float(r.place.avg_rating or 0.0)
            )
        items.append(item)

    return PaginatedResponse[ReviewRead](
        success=True,
        message="User reviews retrieved successfully.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.get(
    "/place/{place_uuid}",
    response_model=PaginatedResponse[ReviewRead],
    summary="List place reviews",
    description="Retrieve approved user reviews for a tourist place."
)
async def list_place_reviews(
    place_uuid: str,
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size limit"),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_uuid(db, uuid=place_uuid)
    if not place:
        place = await crud_place.get_by_slug(db, slug=place_uuid)
    if not place:
        place = await crud_place.get_by_fuzzy_slug(db, identifier=place_uuid)
    if not place:
        raise ResourceNotFoundException("Place", place_uuid)

    skip = (page - 1) * page_size
    reviews = await crud_review.get_place_reviews(db, place_id=place.id, skip=skip, limit=page_size)

    items = [ReviewRead.model_validate(r) for r in reviews]
    total = place.total_reviews
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse[ReviewRead](
        success=True,
        message="Place reviews retrieved successfully.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.post(
    "/place/{place_uuid}",
    response_model=ResponseModel[ReviewRead],
    status_code=status.HTTP_201_CREATED,
    summary="Submit place review",
    description="Submit a review and rating for a tourist place."
)
async def submit_review(
    place_uuid: str,
    review_in: ReviewCreate,
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

    existing = await crud_review.get_user_review_for_place(db, user_id=current_user.id, place_id=place.id)
    if existing:
        existing.rating = review_in.rating
        existing.comment = review_in.comment
        existing.status = "approved"
        db.add(existing)
        await db.flush()
        await crud_review.recalculate_place_rating(db, place_id=place.id)
        await db.commit()
        await db.refresh(existing)
        refreshed = await crud_review.get_by_uuid(db, uuid=existing.uuid)
        return ResponseModel[ReviewRead](
            success=True,
            message="Review updated successfully.",
            data=ReviewRead.model_validate(refreshed or existing)
        )

    review = await crud_review.create_review(
        db,
        user_id=current_user.id,
        place_id=place.id,
        review_in=review_in
    )

    refreshed = await crud_review.get_by_uuid(db, uuid=review.uuid)

    return ResponseModel[ReviewRead](
        success=True,
        message="Review submitted successfully.",
        data=ReviewRead.model_validate(refreshed or review)
    )


@router.patch(
    "/{uuid}",
    response_model=ResponseModel[ReviewRead],
    summary="Update review",
    description="Update review comment or star rating."
)
async def update_review(
    uuid: str,
    review_in: ReviewUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    review = await crud_review.get_by_uuid(db, uuid=uuid)
    if not review:
        raise ResourceNotFoundException("Review", uuid)

    updated = await crud_review.update(db, db_obj=review, obj_in=review_in)
    await crud_review.recalculate_place_rating(db, place_id=updated.place_id)
    await db.commit()

    refreshed = await crud_review.get_by_uuid(db, uuid=updated.uuid)

    return ResponseModel[ReviewRead](
        success=True,
        message="Review updated successfully.",
        data=ReviewRead.model_validate(refreshed or updated)
    )


@router.delete(
    "/{uuid}",
    response_model=ResponseModel[dict],
    summary="Delete review",
    description="Delete a review submission."
)
async def delete_review(
    uuid: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    review = await crud_review.get_by_uuid(db, uuid=uuid)
    if not review:
        raise ResourceNotFoundException("Review", uuid)

    place_id = review.place_id
    await crud_review.remove(db, id=review.id)
    await crud_review.recalculate_place_rating(db, place_id=place_id)
    await db.commit()

    return ResponseModel[dict](
        success=True,
        message="Review deleted successfully.",
        data={}
    )


@router.post(
    "/{uuid}/moderate",
    response_model=ResponseModel[ReviewRead],
    summary="Moderate review (Admin only)",
    description="Approve or reject a submitted user review."
)
async def moderate_review(
    uuid: str,
    mod_in: ReviewModerate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    review = await crud_review.get_by_uuid(db, uuid=uuid)
    if not review:
        raise ResourceNotFoundException("Review", uuid)

    moderated = await crud_review.moderate_review(db, review_id=review.id, status=mod_in.status)
    refreshed = await crud_review.get_by_uuid(db, uuid=uuid)

    return ResponseModel[ReviewRead](
        success=True,
        message=f"Review moderation set to '{mod_in.status}'.",
        data=ReviewRead.model_validate(refreshed or moderated)
    )
