from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_active_user, get_db
from app.core.exceptions import AuthenticationException
from app.core.security import verify_password
from app.crud.crud_user import crud_user
from app.models.user import User
from app.schemas.common import ResponseModel
from app.schemas.user import PasswordChange, UserRead, UserUpdate

router = APIRouter()


@router.get(
    "/me",
    response_model=ResponseModel[UserRead],
    summary="Get current user profile",
    description="Retrieve full authenticated user profile details."
)
async def get_my_profile(
    current_user: User = Depends(get_current_active_user)
):
    return ResponseModel[UserRead](
        success=True,
        message="User profile retrieved successfully.",
        data=UserRead.model_validate(current_user)
    )


@router.patch(
    "/me",
    response_model=ResponseModel[UserRead],
    summary="Update current user profile",
    description="Update current user full name, phone number, or avatar picture URL."
)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    updated_user = await crud_user.update(db, db_obj=current_user, obj_in=user_update)
    return ResponseModel[UserRead](
        success=True,
        message="Profile updated successfully.",
        data=UserRead.model_validate(updated_user)
    )


@router.post(
    "/me/change-password",
    response_model=ResponseModel[dict],
    summary="Change user password",
    description="Change current user account password after verifying current password."
)
async def change_my_password(
    pwd_in: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(pwd_in.current_password, current_user.password_hash):
        raise AuthenticationException("Current password verification failed")

    await crud_user.change_password(db, db_obj=current_user, new_password=pwd_in.new_password)
    return ResponseModel[dict](
        success=True,
        message="Password changed successfully.",
        data={}
    )


@router.get(
    "/me/stats",
    response_model=ResponseModel[dict],
    summary="Get user portal statistics",
    description="Retrieve live user account statistics including saved places, review counts, and profile completion."
)
async def get_my_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select, func
    from app.models.favorite import Favorite
    from app.models.review import Review

    fav_stmt = select(func.count(Favorite.id)).where(Favorite.user_id == current_user.id)
    fav_res = await db.execute(fav_stmt)
    fav_count = fav_res.scalar() or 0

    rev_stmt = select(func.count(Review.id)).where(Review.user_id == current_user.id)
    rev_res = await db.execute(rev_stmt)
    rev_count = rev_res.scalar() or 0

    # Calculate profile completion dynamically
    completion_score = 40 # Base for account creation
    if current_user.avatar_url:
        completion_score += 20
    if current_user.full_name:
        completion_score += 20
    if getattr(current_user, 'phone', None) or getattr(current_user, 'phone_number', None):
        completion_score += 20

    return ResponseModel[dict](
        success=True,
        message="User statistics retrieved successfully.",
        data={
            "saved_places": fav_count,
            "reviews_count": rev_count,
            "trips_count": 0,
            "profile_completion_pct": min(100, completion_score)
        }
    )

