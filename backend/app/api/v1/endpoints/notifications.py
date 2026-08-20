import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, desc

from app.api.deps import get_db, get_current_user_optional
from app.models.notification import Notification
from app.models.user import User
from app.schemas.common import ResponseModel
from app.schemas.notification import NotificationRead

router = APIRouter()

INITIAL_SEED_NOTIFICATIONS = [
    {
        "title": "Account Authentication Verified",
        "message": "Your Nearby account profile authentication token is active and secure.",
        "type": "travel",
        "link_url": "/user/security",
    },
    {
        "title": "Review Moderation System Ready",
        "message": "Any submitted tourist place reviews will be audited by administrators.",
        "type": "review",
        "link_url": "/user/reviews",
    },
    {
        "title": "Bookmark Sync System Online",
        "message": "Saved places are synchronized directly with your authenticated user profile.",
        "type": "favorite",
        "link_url": "/user/favorites",
    },
    {
        "title": "Spatial Radar Recommendations",
        "message": "Explore regional historic spots, waterfalls, and coastal fortresses near your area.",
        "type": "suggestion",
        "link_url": "/user/nearby",
    },
]


async def seed_initial_notifications_if_empty(db: AsyncSession, user_id: Optional[int] = None) -> List[Notification]:
    """Auto-seeds initial notification records into DB if notifications table is empty for user."""
    stmt = select(Notification)
    if user_id:
        stmt = stmt.where((Notification.user_id == user_id) | (Notification.user_id.is_(None)))
    res = await db.execute(stmt)
    existing = list(res.scalars().all())

    if not existing:
        new_items = []
        for item in INITIAL_SEED_NOTIFICATIONS:
            notif = Notification(
                uuid=str(uuid.uuid4()),
                user_id=user_id,
                title=item["title"],
                message=item["message"],
                type=item["type"],
                is_read=False,
                link_url=item["link_url"]
            )
            db.add(notif)
            new_items.append(notif)
        await db.commit()
        for item in new_items:
            await db.refresh(item)
        return new_items

    return existing


@router.get(
    "",
    response_model=ResponseModel[List[NotificationRead]],
    summary="List user & system notifications from database"
)
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None

    # Check if empty, auto-seed
    await seed_initial_notifications_if_empty(db, user_id)

    stmt = select(Notification)
    if user_id:
        stmt = stmt.where((Notification.user_id == user_id) | (Notification.user_id.is_(None)))
    stmt = stmt.order_by(desc(Notification.created_at))

    res = await db.execute(stmt)
    notifications = list(res.scalars().all())

    return ResponseModel[List[NotificationRead]](
        success=True,
        message=f"Retrieved {len(notifications)} notifications from database.",
        data=notifications
    )


@router.patch(
    "/{notif_uuid}/read",
    response_model=ResponseModel[NotificationRead],
    summary="Mark single notification as read"
)
async def mark_notification_read(
    notif_uuid: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    stmt = select(Notification).where(Notification.uuid == notif_uuid)
    res = await db.execute(stmt)
    notif = res.scalar_one_or_none()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    await db.commit()
    await db.refresh(notif)

    return ResponseModel[NotificationRead](
        success=True,
        message="Notification marked as read.",
        data=notif
    )


@router.put(
    "/mark-all-read",
    response_model=ResponseModel[dict],
    summary="Mark all notifications as read"
)
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    stmt = update(Notification).values(is_read=True)
    if user_id:
        stmt = stmt.where((Notification.user_id == user_id) | (Notification.user_id.is_(None)))

    await db.execute(stmt)
    await db.commit()

    return ResponseModel[dict](
        success=True,
        message="All notifications marked as read in database.",
        data={"updated": True}
    )


@router.delete(
    "/clear-all",
    response_model=ResponseModel[dict],
    summary="Clear all notifications"
)
async def clear_all_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    stmt = delete(Notification)
    if user_id:
        stmt = stmt.where((Notification.user_id == user_id) | (Notification.user_id.is_(None)))

    await db.execute(stmt)
    await db.commit()

    return ResponseModel[dict](
        success=True,
        message="All notifications cleared from database.",
        data={"cleared": True}
    )


@router.delete(
    "/{notif_uuid}",
    response_model=ResponseModel[dict],
    summary="Delete single notification"
)
async def delete_notification(
    notif_uuid: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = delete(Notification).where(Notification.uuid == notif_uuid)
    res = await db.execute(stmt)
    await db.commit()

    return ResponseModel[dict](
        success=True,
        message="Notification removed from database.",
        data={"deleted": True}
    )
