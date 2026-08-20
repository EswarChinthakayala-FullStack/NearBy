from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.core.config import settings
from app.core.exceptions import AuthenticationException, AuthorizationException, ConflictException
from app.core.security import create_access_token, create_refresh_token, decode_jwt_token
from app.crud.crud_user import crud_user
from app.models.user import RefreshToken
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenPair
from app.schemas.common import ResponseModel
from app.schemas.user import UserRead

router = APIRouter()


@router.post(
    "/register",
    response_model=ResponseModel[UserRead],
    status_code=status.HTTP_201_CREATED,
    summary="Register new user account (Disabled)",
    description="Public registration is disabled. Only admin accounts are permitted."
)
async def register(
    user_in: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    raise AuthorizationException("Public registration is disabled. Only admin login is permitted.")


@router.post(
    "/login",
    response_model=ResponseModel[TokenPair],
    summary="User login authentication",
    description="Authenticate user with email and password, returning JWT access and refresh token pair."
)
async def login(
    login_in: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    user = await crud_user.authenticate(db, email=login_in.email, password=login_in.password)
    if not user:
        raise AuthenticationException("Invalid email address or password")

    if not user.is_active:
        raise AuthenticationException("User account is inactive")

    access_token = create_access_token(user_uuid=user.uuid)
    refresh_token = create_refresh_token(user_uuid=user.uuid)

    # Persist refresh token to DB
    expires_at = datetime.now(timezone.utc).replace(tzinfo=None)
    rf_obj = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=expires_at
    )
    db.add(rf_obj)
    await db.commit()

    token_pair = TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return ResponseModel[TokenPair](
        success=True,
        message="Authentication successful.",
        data=token_pair
    )


@router.post(
    "/refresh",
    response_model=ResponseModel[TokenPair],
    summary="Refresh access token",
    description="Obtain a new access token using a valid refresh token."
)
async def refresh_token(
    refresh_in: RefreshRequest,
    db: AsyncSession = Depends(get_db)
):
    payload = decode_jwt_token(refresh_in.refresh_token, expected_type="refresh")
    user_uuid = payload.get("sub")
    if not user_uuid:
        raise AuthenticationException("Invalid refresh token payload")

    user = await crud_user.get_by_uuid(db, uuid=str(user_uuid))
    if not user or not user.is_active:
        raise AuthenticationException("User account is disabled or no longer exists")

    new_access_token = create_access_token(user_uuid=user.uuid)
    new_refresh_token = create_refresh_token(user_uuid=user.uuid)

    token_pair = TokenPair(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return ResponseModel[TokenPair](
        success=True,
        message="Token refreshed successfully.",
        data=token_pair
    )


@router.post(
    "/logout",
    response_model=ResponseModel[dict],
    summary="User logout",
    description="Logout user session."
)
async def logout():
    return ResponseModel[dict](
        success=True,
        message="Successfully logged out.",
        data={}
    )
