from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_active_user, get_current_admin, get_db, get_current_user_optional
from app.models.favorite import Favorite
from sqlalchemy import select
from app.core.exceptions import ResourceNotFoundException
from app.core.logging_config import logger
from app.crud.crud_image import crud_image
from app.crud.crud_place import crud_place
from app.models.user import User
from app.schemas.common import PaginatedResponse, PaginationMeta, ResponseModel
from app.schemas.image import PlaceImageCreate
from app.schemas.place import PlaceCreate, PlaceFilterParams, PlaceListItem, PlaceRead, PlaceUpdate
from app.scrapers.bing_image_scraper import bing_image_scraper
from app.scrapers.wikimedia_fetcher import wikimedia_fetcher
from app.services.wikipedia_service import wikipedia_service
from app.utils.image_helpers import get_place_cover_image

router = APIRouter()


async def _auto_enrich_place(db: AsyncSession, place):
    """Asynchronously enrich place description from Wikipedia and images from Bing image scraper if missing."""
    needs_refresh = False

    # 1. Wikipedia Description & History Enrichment
    if not place.description or len(place.description) < 40:
        try:
            wiki_res = await wikipedia_service.enrich_place_content(db, place.id)
            if wiki_res.get("status") == "success":
                needs_refresh = True
        except Exception as wiki_err:
            logger.warning(f"Wikipedia enrichment failed for place '{place.name}': {wiki_err}")

    # 2. Bing Multi-Image Scraper Enrichment
    if not place.images or len(place.images) < 3:
        try:
            query = f"{place.name} {place.city or place.state or ''}".strip()
            bing_results = await bing_image_scraper.fetch_images(query=query, limit=8)
            if bing_results:
                existing_urls = {img.image_url for img in (place.images or [])}
                added = 0
                for idx, item in enumerate(bing_results):
                    img_url = item.get("image_url")
                    if img_url and img_url not in existing_urls:
                        image_in = PlaceImageCreate(
                            image_url=img_url,
                            thumbnail_url=item.get("thumbnail_url") or img_url,
                            source="bing",
                            is_cover=(len(place.images or []) == 0 and added == 0),
                            sort_order=len(place.images or []) + added
                        )
                        await crud_image.add_place_image(db, place_id=place.id, image_in=image_in)
                        added += 1
                if added > 0:
                    needs_refresh = True
        except Exception as bing_err:
            logger.warning(f"Bing image scraper failed for place '{place.name}': {bing_err}")

    if needs_refresh:
        refreshed = await crud_place.get_by_uuid(db, uuid=place.uuid)
        if refreshed:
            return refreshed

    return place


@router.get(
    "",
    response_model=PaginatedResponse[PlaceListItem],
    summary="List and filter tourist places",
    description="Retrieve paginated list of published tourist places filtered by category, city, min rating, or keyword search."
)
async def list_places(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    category_slug: Optional[str] = Query(None, description="Filter by category slug"),
    city: Optional[str] = Query(None, description="Filter by city name"),
    query: Optional[str] = Query(None, description="Keyword search term"),
    min_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Minimum average rating threshold"),
    status_filter: Optional[str] = Query("published", alias="status", description="Status filter (published, draft, archived)"),
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size limit"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not category_id and category_slug:
        from app.crud.crud_category import crud_category
        cat = await crud_category.get_by_slug(db, slug=category_slug)
        if cat:
            category_id = cat.id

    filters = PlaceFilterParams(
        category_id=category_id,
        city=city,
        query=query,
        min_rating=min_rating,
        status=status_filter,
        page=page,
        page_size=page_size
    )

    places, total = await crud_place.filter_places(db, filters=filters)

    user_fav_ids = set()
    if current_user:
        fav_stmt = select(Favorite.place_id).where(Favorite.user_id == current_user.id)
        fav_res = await db.execute(fav_stmt)
        user_fav_ids = set(fav_res.scalars().all())

    items = []
    for p in places:
        cover_url = get_place_cover_image(p)
        item = PlaceListItem(
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
            cover_image_url=cover_url,
            is_favorite=p.id in user_fav_ids
        )
        items.append(item)

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse[PlaceListItem](
        success=True,
        message="Places retrieved successfully.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.get(
    "/{identifier}",
    response_model=ResponseModel[PlaceRead],
    summary="Get place details by UUID or Slug",
    description="Retrieve full place details by public UUID string or SEO-friendly slug."
)
async def get_place(
    identifier: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    place = await crud_place.get_by_uuid(db, uuid=identifier)
    if not place:
        place = await crud_place.get_by_slug(db, slug=identifier)
    if not place:
        place = await crud_place.get_by_fuzzy_slug(db, identifier=identifier)
    if not place:
        # Dynamically auto-create place record to prevent 404s on AI generated itinerary slugs
        raw_title = identifier.replace("-", " ").replace("_", " ").title()
        clean_slug = identifier.lower().strip().replace(" ", "-")
        create_data = {
            "name": raw_title,
            "slug": clean_slug,
            "category_id": 1,
            "description": f"Popular tourist attraction and destination: {raw_title}.",
            "address": f"{raw_title}, India",
            "city": "Destination",
            "state": "India",
            "country": "India",
            "latitude": 17.3850,
            "longitude": 78.4866,
            "status": "published",
            "source": "auto_gen"
        }
        created = await crud_place.create(db, obj_in=create_data)
        refreshed = await crud_place.get_by_uuid(db, uuid=created.uuid)
        place = refreshed or created

    enriched_place = await _auto_enrich_place(db, place)

    is_fav = False
    if current_user and place:
        fav_stmt = select(Favorite.id).where((Favorite.user_id == current_user.id) & (Favorite.place_id == place.id))
        fav_res = await db.execute(fav_stmt)
        is_fav = fav_res.scalar() is not None

    read_obj = PlaceRead.model_validate(enriched_place)
    read_obj.is_favorite = is_fav

    return ResponseModel[PlaceRead](
        success=True,
        message="Place details retrieved successfully.",
        data=read_obj
    )


@router.get(
    "/slug/{slug}",
    response_model=ResponseModel[PlaceRead],
    summary="Get place details by slug",
    description="Retrieve full place details by URL slug."
)
async def get_place_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    place = await crud_place.get_by_slug(db, slug=slug)
    if not place:
        raise ResourceNotFoundException("Place", slug)

    enriched_place = await _auto_enrich_place(db, place)

    is_fav = False
    if current_user and place:
        fav_stmt = select(Favorite.id).where((Favorite.user_id == current_user.id) & (Favorite.place_id == place.id))
        fav_res = await db.execute(fav_stmt)
        is_fav = fav_res.scalar() is not None

    read_obj = PlaceRead.model_validate(enriched_place)
    read_obj.is_favorite = is_fav

    return ResponseModel[PlaceRead](
        success=True,
        message="Place details retrieved successfully.",
        data=read_obj
    )


_place_photos_cache: dict = {}

@router.get(
    "/{identifier}/photos",
    response_model=ResponseModel[List[dict]],
    summary="Explore HD photos for a place",
    description="Retrieve paginated HD photo gallery with lazy loading and cache."
)
async def explore_place_photos(
    identifier: str,
    limit: int = Query(16, ge=1, le=50, description="Image count limit"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_uuid(db, uuid=identifier)
    if not place:
        place = await crud_place.get_by_slug(db, slug=identifier)

    if not place:
        raise ResourceNotFoundException("Place", identifier)

    cache_key = f"photos_{place.id}"

    # Check if cached results fulfill offset range
    if cache_key in _place_photos_cache:
        cached_list = _place_photos_cache[cache_key]
        if len(cached_list) >= offset + limit:
            paginated = cached_list[offset : offset + limit]
            return ResponseModel[List[dict]](
                success=True,
                message=f"Retrieved photos for '{place.name}' (cached).",
                data=paginated
            )

    # 1. Retrieve stored DB images
    db_images_objs = await crud_image.get_place_images(db, place_id=place.id)
    existing_images = []
    for img in db_images_objs:
        if img.image_url:
            existing_images.append({
                "image_url": img.image_url,
                "thumbnail_url": img.thumbnail_url or img.image_url,
                "title": f"{place.name} photo",
                "source": img.source or "db"
            })

    # 2. Fetch Bing scraper with target count for pagination expansion
    target_count = max(30, offset + limit + 10)
    query = f"{place.name} {place.city or place.state or ''}".strip()
    bing_results = await bing_image_scraper.fetch_images(query=query, limit=target_count)

    # 3. Fetch Wikimedia if total images count is less than 15
    wm_results = []
    if len(existing_images) + len(bing_results) < 15:
        query = f"{place.name} {place.city or place.state or ''}".strip()
        wm_results = await wikimedia_fetcher.fetch_images(query=query, limit=15)

    all_results = existing_images + bing_results + wm_results
    seen = set()
    deduped = []
    for item in all_results:
        url = item.get("image_url")
        if url and url not in seen:
            seen.add(url)
            deduped.append(item)

    _place_photos_cache[cache_key] = deduped
    paginated = deduped[offset : offset + limit]

    return ResponseModel[List[dict]](
        success=True,
        message=f"Retrieved photos for '{place.name}'.",
        data=paginated
    )


@router.get(
    "/{identifier}/wikipedia",
    response_model=ResponseModel[dict],
    summary="Get Wikipedia details for place",
    description="Retrieve live Wikipedia overview, summary, section extracts, and article URL for a place."
)
async def get_place_wikipedia_details(
    identifier: str,
    db: AsyncSession = Depends(get_db)
):
    from app.scrapers.wikipedia_scraper import wikipedia_place_info_service

    place = await crud_place.get_by_uuid(db, uuid=identifier)
    if not place:
        place = await crud_place.get_by_slug(db, slug=identifier)

    if not place:
        raise ResourceNotFoundException("Place", identifier)

    query = f"{place.name} {place.city}" if place.city else place.name
    wiki_details = await wikipedia_place_info_service.fetch_place_info(query)

    # Persist enriched description to DB if missing or minimal
    if wiki_details.get("summary") and (not place.description or len(place.description) < 40):
        place.description = wiki_details["summary"]
        if wiki_details.get("content"):
            place.history = wiki_details["content"][:500]
        db.add(place)
        await db.commit()

    return ResponseModel[dict](
        success=True,
        message=f"Retrieved Wikipedia details for '{place.name}'.",
        data=wiki_details
    )


@router.post(
    "",
    response_model=ResponseModel[PlaceRead],
    status_code=status.HTTP_201_CREATED,
    summary="Create tourist place",
    description="Create a new tourist place (Admin or authenticated user)."
)
async def create_place(
    place_in: PlaceCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    create_dict = place_in.model_dump(exclude_unset=True)
    if not create_dict.get("slug"):
        create_dict["slug"] = place_in.name.lower().replace(" ", "-")

    create_dict["created_by"] = current_user.id
    create_dict["source"] = "admin" if current_user.role == "admin" else "osm"

    place = await crud_place.create(db, obj_in=create_dict)
    refreshed_place = await crud_place.get_by_uuid(db, uuid=place.uuid)

    return ResponseModel[PlaceRead](
        success=True,
        message="Place created successfully.",
        data=PlaceRead.model_validate(refreshed_place or place)
    )


@router.patch(
    "/{uuid}",
    response_model=ResponseModel[PlaceRead],
    summary="Update tourist place",
    description="Update existing tourist place details."
)
async def update_place(
    uuid: str,
    place_in: PlaceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_uuid(db, uuid=uuid)
    if not place:
        raise ResourceNotFoundException("Place", uuid)

    updated = await crud_place.update(db, db_obj=place, obj_in=place_in)
    refreshed = await crud_place.get_by_uuid(db, uuid=updated.uuid)

    return ResponseModel[PlaceRead](
        success=True,
        message="Place updated successfully.",
        data=PlaceRead.model_validate(refreshed or updated)
    )


@router.delete(
    "/{uuid}",
    response_model=ResponseModel[dict],
    summary="Delete tourist place (Admin only)",
    description="Permanently remove a tourist place record."
)
async def delete_place(
    uuid: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_uuid(db, uuid=uuid)
    if not place:
        raise ResourceNotFoundException("Place", uuid)

    await crud_place.remove(db, id=place.id)
    return ResponseModel[dict](
        success=True,
        message="Place deleted successfully.",
        data={}
    )


@router.post(
    "/{uuid}/publish",
    response_model=ResponseModel[PlaceRead],
    summary="Publish place (Admin only)",
    description="Set place status to published."
)
async def publish_place(
    uuid: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_uuid(db, uuid=uuid)
    if not place:
        raise ResourceNotFoundException("Place", uuid)

    place.status = "published"
    db.add(place)
    await db.commit()
    await db.refresh(place)

    return ResponseModel[PlaceRead](
        success=True,
        message="Place published successfully.",
        data=PlaceRead.model_validate(place)
    )


@router.post(
    "/{uuid}/archive",
    response_model=ResponseModel[PlaceRead],
    summary="Archive place (Admin only)",
    description="Set place status to archived."
)
async def archive_place(
    uuid: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_uuid(db, uuid=uuid)
    if not place:
        raise ResourceNotFoundException("Place", uuid)

    place.status = "archived"
    db.add(place)
    await db.commit()
    await db.refresh(place)

    return ResponseModel[PlaceRead](
        success=True,
        message="Place archived successfully.",
        data=PlaceRead.model_validate(place)
    )


@router.post(
    "/{place_uuid}/favorite",
    response_model=ResponseModel[dict],
    summary="Favorite place",
    description="Add or toggle place favorite for current user."
)
async def favorite_place(
    place_uuid: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    from app.crud.crud_favorite import crud_favorite
    place = await crud_place.get_by_uuid(db, uuid=place_uuid)
    if not place:
        place = await crud_place.get_by_slug(db, slug=place_uuid)
    if not place:
        raise ResourceNotFoundException("Place", place_uuid)

    is_fav, updated_total = await crud_favorite.toggle_favorite(
        db, user_id=current_user.id, place_id=place.id
    )

    msg = "Place added to favorites." if is_fav else "Place removed from favorites."
    return ResponseModel[dict](
        success=True,
        message=msg,
        data={
            "is_favorited": is_fav,
            "message": msg,
            "total_favorites": updated_total
        }
    )


@router.delete(
    "/{place_uuid}/favorite",
    response_model=ResponseModel[dict],
    summary="Remove favorite place",
    description="Remove place favorite for current user."
)
async def remove_place_favorite(
    place_uuid: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    from app.crud.crud_favorite import crud_favorite
    place = await crud_place.get_by_uuid(db, uuid=place_uuid)
    if not place:
        place = await crud_place.get_by_slug(db, slug=place_uuid)
    if not place:
        raise ResourceNotFoundException("Place", place_uuid)

    if await crud_favorite.is_favorited(db, user_id=current_user.id, place_id=place.id):
        await crud_favorite.toggle_favorite(db, user_id=current_user.id, place_id=place.id)

    return ResponseModel[dict](
        success=True,
        message="Favorite removed successfully.",
        data={"is_favorited": False}
    )
