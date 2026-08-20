from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_admin, get_db
from app.core.exceptions import ResourceNotFoundException
from app.crud.crud_place import crud_place
from app.crud.crud_user import crud_user
from app.models.review import Review
from app.models.sync_log import AdminActivityLog, ContentSyncLog, OsmSyncLog
from app.models.user import User
from app.schemas.common import PaginatedResponse, PaginationMeta, ResponseModel
from app.schemas.review import ReviewRead
from app.schemas.user import UserRead
from app.tasks.image_tasks import scrape_place_images_task
from app.tasks.osm_tasks import sync_osm_places_task
from app.tasks.wikipedia_tasks import sync_wikipedia_content_task

from sqlalchemy.orm import selectinload

router = APIRouter()


from datetime import datetime, timezone

@router.post(
    "/sync/osm",
    response_model=ResponseModel[dict],
    summary="Trigger OSM places synchronization (Admin only)",
    description="Dispatch background task to import tourist places from OpenStreetMap Overpass API."
)
async def trigger_osm_sync(
    city: str = Query("Delhi", description="Target city name for OSM import"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    from app.services.osm_service import osm_service

    sync_log = OsmSyncLog(
        sync_type="osm_import",
        region=city,
        status="in_progress",
        total_fetched=0,
        total_imported=0,
        started_at=datetime.now()
    )
    db.add(sync_log)
    await db.commit()
    await db.refresh(sync_log)

    # Record Admin Activity Audit Log
    try:
        act = AdminActivityLog(
            admin_id=admin.id,
            action="IMPORT_OSM_DATA",
            entity_type="region",
            entity_id=sync_log.id,
            created_at=datetime.now()
        )
        db.add(act)
        await db.commit()
    except Exception:
        pass

    try:
        res = await osm_service.import_places_for_region(db, region=city)
        sync_log.status = "completed"
        sync_log.total_fetched = res.get("total_fetched", 0)
        sync_log.total_imported = res.get("total_imported", 0)
        sync_log.finished_at = datetime.now()
        await db.commit()
        message = f"OSM places sync completed for city '{city}'. Imported {res.get('total_imported', 0)} places."
    except Exception as err:
        sync_log.status = "failed"
        sync_log.error_message = str(err)
        sync_log.finished_at = datetime.now()
        await db.commit()
        message = f"OSM sync failed for city '{city}': {str(err)}"

    return ResponseModel[dict](
        success=True,
        message=message,
        data={
            "sync_log_id": sync_log.id,
            "status": sync_log.status,
            "total_fetched": sync_log.total_fetched,
            "total_imported": sync_log.total_imported
        }
    )


@router.post(
    "/sync/wikipedia",
    response_model=ResponseModel[dict],
    summary="Trigger Wikipedia content sync (Admin only)",
    description="Dispatch background task to enrich places with Wikipedia summaries."
)
async def trigger_wikipedia_sync(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    from app.services.wikipedia_service import wikipedia_service

    sync_log = OsmSyncLog(
        sync_type="wikipedia_enrichment",
        region="Global",
        status="in_progress",
        total_fetched=0,
        total_imported=0,
        started_at=datetime.now()
    )
    db.add(sync_log)
    await db.commit()
    await db.refresh(sync_log)

    try:
        res = await wikipedia_service.enrich_all_places_content(db)
        sync_log.status = "completed"
        sync_log.total_fetched = res.get("total_processed", 0)
        sync_log.total_imported = res.get("enriched_count", 0)
        sync_log.finished_at = datetime.now()
        await db.commit()
        message = f"Wikipedia content enrichment completed. Enriched {res.get('enriched_count', 0)} places."
    except Exception as err:
        sync_log.status = "failed"
        sync_log.error_message = str(err)
        sync_log.finished_at = datetime.now()
        await db.commit()
        message = f"Wikipedia enrichment failed: {str(err)}"

    return ResponseModel[dict](
        success=True,
        message=message,
        data={
            "sync_log_id": sync_log.id,
            "status": sync_log.status,
            "total_fetched": sync_log.total_fetched,
            "total_imported": sync_log.total_imported
        }
    )


@router.post(
    "/sync/wikipedia/{uuid}",
    response_model=ResponseModel[dict],
    summary="Trigger Wikipedia sync for place (Admin only)",
    description="Dispatch background task to enrich specific place description and history from Wikipedia."
)
async def trigger_place_wikipedia_sync(
    uuid: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_uuid(db, uuid=uuid)
    if not place:
        raise ResourceNotFoundException("Place", uuid)

    task = sync_wikipedia_content_task.delay(place.id)
    return ResponseModel[dict](
        success=True,
        message=f"Wikipedia enrichment job dispatched for place '{place.name}'.",
        data={"task_id": task.id, "place_uuid": place.uuid}
    )


@router.post(
    "/sync/images/{identifier}",
    response_model=ResponseModel[dict],
    summary="Trigger image acquisition pipeline for place (Admin only)",
    description="Dispatch task to acquire candidate images for place from Wikimedia / Bing by UUID, slug, or ID."
)
async def trigger_place_images_sync(
    identifier: str,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    place = await crud_place.get_by_slug(db, slug=identifier)
    if not place:
        place = await crud_place.get_by_uuid(db, uuid=identifier)
    if not place and identifier.isdigit():
        place = await crud_place.get(db, id=int(identifier))
    if not place:
        raise ResourceNotFoundException("Place", identifier)

    res = await image_scraper_service.scrape_and_save_place_images(db, place_id=place.id, limit=3)
    return ResponseModel[dict](
        success=True,
        message=f"Image acquisition completed for place '{place.name}'. Saved {res.get('saved_count', 0)} images.",
        data={"place_uuid": place.uuid, "saved_count": res.get("saved_count", 0)}
    )


@router.get(
    "/sync-logs",
    response_model=PaginatedResponse[dict],
    summary="View synchronization job history (Admin only)",
    description="Retrieve paginated list of OpenStreetMap and content synchronization audit logs."
)
async def get_sync_logs(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size limit"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * page_size
    stmt = select(OsmSyncLog).order_by(OsmSyncLog.started_at.desc()).offset(skip).limit(page_size)
    res = await db.execute(stmt)
    logs = list(res.scalars().all())

    count_stmt = select(func.count()).select_from(OsmSyncLog)
    count_res = await db.execute(count_stmt)
    total = count_res.scalar_one() or 0

    items = []
    for l in logs:
        items.append({
            "id": l.id,
            "sync_type": l.sync_type,
            "region": l.region,
            "status": l.status,
            "total_fetched": l.total_fetched,
            "total_imported": l.total_imported,
            "total_skipped": l.total_skipped,
            "started_at": l.started_at.isoformat() if l.started_at else None,
            "finished_at": l.finished_at.isoformat() if l.finished_at else None
        })

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse[dict](
        success=True,
        message="Synchronization logs retrieved successfully.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.get(
    "/moderation",
    response_model=PaginatedResponse[ReviewRead],
    summary="View pending moderation queue (Admin only)",
    description="Retrieve paginated list of user reviews awaiting administrative moderation."
)
async def get_moderation_queue(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size limit"),
    status: Optional[str] = Query(None, description="Filter status: pending, approved, rejected, or all"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * page_size
    query = select(Review).options(
        selectinload(Review.images),
        selectinload(Review.user),
        selectinload(Review.place)
    )

    if status and status.lower() != "all":
        query = query.where(Review.status == status.lower())
    elif not status:
        query = query.where(Review.status == "pending")

    stmt = query.order_by(Review.created_at.desc()).offset(skip).limit(page_size)
    res = await db.execute(stmt)
    reviews = list(res.scalars().all())

    count_query = select(func.count()).select_from(Review)
    if status and status.lower() != "all":
        count_query = count_query.where(Review.status == status.lower())
    elif not status:
        count_query = count_query.where(Review.status == "pending")

    count_res = await db.execute(count_query)
    total = count_res.scalar_one() or 0

    items = [ReviewRead.model_validate(r) for r in reviews]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse[ReviewRead](
        success=True,
        message="Moderation queue reviews retrieved successfully.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.get(
    "/activity-logs",
    response_model=PaginatedResponse[dict],
    summary="View admin activity logs (Admin only)",
    description="Retrieve paginated administrative audit trail logs."
)
async def get_activity_logs(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size limit"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * page_size
    stmt = (
        select(AdminActivityLog)
        .order_by(AdminActivityLog.created_at.desc())
        .offset(skip)
        .limit(page_size)
    )
    res = await db.execute(stmt)
    logs = list(res.scalars().all())

    count_stmt = select(func.count()).select_from(AdminActivityLog)
    count_res = await db.execute(count_stmt)
    total = count_res.scalar_one() or 0

    items = []
    for l in logs:
        items.append({
            "id": l.id,
            "admin_id": l.admin_id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse[dict](
        success=True,
        message="Admin activity logs retrieved successfully.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.get(
    "/stats",
    response_model=ResponseModel[dict],
    summary="Get admin dashboard metrics (Admin only)",
    description="Retrieve live aggregate database metrics for administrative dashboard cards."
)
async def get_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    from app.models.category import Category
    from app.models.favorite import Favorite
    from app.models.image import PlaceImage
    from app.models.place import Place

    # Places metrics
    total_places_res = await db.execute(select(func.count()).select_from(Place))
    total_places = total_places_res.scalar_one() or 0

    published_places_res = await db.execute(select(func.count()).select_from(Place).where(Place.status == "published"))
    published_places = published_places_res.scalar_one() or 0

    draft_places_res = await db.execute(select(func.count()).select_from(Place).where(Place.status == "draft"))
    draft_places = draft_places_res.scalar_one() or 0

    # Categories metrics
    total_categories_res = await db.execute(select(func.count()).select_from(Category))
    total_categories = total_categories_res.scalar_one() or 0

    # Reviews metrics
    total_reviews_res = await db.execute(select(func.count()).select_from(Review))
    total_reviews = total_reviews_res.scalar_one() or 0

    pending_reviews_res = await db.execute(select(func.count()).select_from(Review).where(Review.status == "pending"))
    pending_reviews = pending_reviews_res.scalar_one() or 0

    approved_reviews_res = await db.execute(select(func.count()).select_from(Review).where(Review.status == "approved"))
    approved_reviews = approved_reviews_res.scalar_one() or 0

    # Users metrics
    total_users_res = await db.execute(select(func.count()).select_from(User))
    total_users = total_users_res.scalar_one() or 0

    active_users_res = await db.execute(select(func.count()).select_from(User).where(User.is_active == True))
    active_users = active_users_res.scalar_one() or 0

    # Favorites & Images metrics
    total_favorites_res = await db.execute(select(func.count()).select_from(Favorite))
    total_favorites = total_favorites_res.scalar_one() or 0

    total_images_res = await db.execute(select(func.count()).select_from(PlaceImage))
    total_images = total_images_res.scalar_one() or 0

    # Last sync log
    last_sync_res = await db.execute(select(OsmSyncLog).order_by(OsmSyncLog.started_at.desc()).limit(1))
    last_sync_log = last_sync_res.scalars().first()

    return ResponseModel[dict](
        success=True,
        message="Dashboard aggregate metrics retrieved successfully.",
        data={
            "total_places": total_places,
            "published_places": published_places,
            "draft_places": draft_places,
            "total_categories": total_categories,
            "total_reviews": total_reviews,
            "pending_reviews": pending_reviews,
            "approved_reviews": approved_reviews,
            "total_users": total_users,
            "active_users": active_users,
            "total_favorites": total_favorites,
            "total_images": total_images,
            "last_sync_status": last_sync_log.status if last_sync_log else "idle",
            "last_sync_time": last_sync_log.started_at.isoformat() if (last_sync_log and last_sync_log.started_at) else None,
        }
    )


@router.get(
    "/activity-logs",
    response_model=PaginatedResponse[dict],
    summary="Get administrative activity audit logs (Admin only)",
    description="Retrieve paginated list of administrative activity audit logs."
)
async def get_activity_logs(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size limit"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * page_size

    # Check total logs in AdminActivityLog
    count_stmt = select(func.count()).select_from(AdminActivityLog)
    total_res = await db.execute(count_stmt)
    total_items = total_res.scalar_one() or 0

    # Auto-seed initial activity audit logs from sync logs & place actions if empty
    if total_items == 0:
        sync_logs_res = await db.execute(select(OsmSyncLog).order_by(OsmSyncLog.started_at.desc()).limit(15))
        sync_logs = sync_logs_res.scalars().all()
        for s in sync_logs:
            action_name = "IMPORT_OSM_DATA" if "import" in s.sync_type.lower() else "ENRICH_WIKIPEDIA"
            act = AdminActivityLog(
                admin_id=admin.id,
                action=action_name,
                entity_type=s.region or "region",
                entity_id=s.id,
                created_at=s.started_at or datetime.now()
            )
            db.add(act)
        await db.commit()
        
        # Recount
        total_res = await db.execute(count_stmt)
        total_items = total_res.scalar_one() or 0

    stmt = (
        select(AdminActivityLog)
        .order_by(AdminActivityLog.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    res = await db.execute(stmt)
    logs = res.scalars().all()

    items = [
        {
            "id": log.id,
            "admin_id": log.admin_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "created_at": log.created_at.isoformat() if log.created_at else None
        }
        for log in logs
    ]

    total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 1

    return PaginatedResponse[dict](
        success=True,
        message="Activity logs retrieved successfully.",
        data=items,
        pagination=PaginationMeta(
            total_items=total_items,
            total_pages=total_pages,
            page=page,
            page_size=page_size
        )
    )


@router.get(
    "/users",
    response_model=PaginatedResponse[UserRead],
    summary="Get paginated registered user accounts (Admin only)",
    description="Retrieve paginated user account directory with role and status filtering."
)
async def get_admin_users(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Page size limit"),
    search: Optional[str] = Query(None, description="Search query for name or email"),
    role: Optional[str] = Query(None, description="Filter by user role: admin or user"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * page_size
    query = select(User)

    if search:
        term = f"%{search}%"
        query = query.where(or_(User.full_name.ilike(term), User.email.ilike(term)))
    if role and role.lower() != "all":
        query = query.where(User.role == role.lower())

    count_stmt = select(func.count()).select_from(query.subquery())
    count_res = await db.execute(count_stmt)
    total_items = count_res.scalar_one() or 0

    stmt = query.order_by(User.created_at.desc()).offset(offset).limit(page_size)
    res = await db.execute(stmt)
    users = list(res.scalars().all())

    items = [UserRead.model_validate(u) for u in users]
    total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 1

    return PaginatedResponse[UserRead](
        success=True,
        message="Users directory retrieved successfully.",
        data=items,
        pagination=PaginationMeta(
            total_items=total_items,
            total_pages=total_pages,
            page=page,
            page_size=page_size
        )
    )


@router.patch(
    "/users/{user_id}/status",
    response_model=ResponseModel[UserRead],
    summary="Toggle user active status (Admin only)",
    description="Enable or disable user account access."
)
async def toggle_user_status(
    user_id: int,
    is_active: bool = Query(..., description="Active status flag"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise ResourceNotFoundException("User", str(user_id))

    user.is_active = is_active
    await db.commit()
    await db.refresh(user)

    return ResponseModel[UserRead](
        success=True,
        message=f"User status updated to {'active' if is_active else 'inactive'}.",
        data=UserRead.model_validate(user)
    )


@router.patch(
    "/users/{user_id}/role",
    response_model=ResponseModel[UserRead],
    summary="Update user role (Admin only)",
    description="Update user account role scope (admin or user)."
)
async def update_user_role(
    user_id: int,
    role: str = Query(..., description="User role: admin or user"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise ResourceNotFoundException("User", str(user_id))

    user.role = role.lower()
    await db.commit()
    await db.refresh(user)

    return ResponseModel[UserRead](
        success=True,
        message=f"User role updated to '{role}'.",
        data=UserRead.model_validate(user)
    )
