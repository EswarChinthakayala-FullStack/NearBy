from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import DuplicateEntityException, UnauthorizedException, ValidationException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_jwt_token,
    get_password_hash,
    verify_password
)
from app.repositories.user_repository import UserRepository
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserResponse


class AuthService:
    """Authentication and session management business logic."""

    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    async def register_user(self, user_in: UserCreate) -> UserResponse:
        """Register a new application user."""
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise DuplicateEntityException("User", "email", user_in.email)

        user_data = user_in.model_dump(exclude={"password"})
        user_data["password_hash"] = get_password_hash(user_in.password)
        user_data["role"] = "user"
        user_data["is_active"] = True
        user_data["is_verified"] = False

        user = await self.user_repo.create(user_data)
        return UserResponse.model_validate(user)

    async def login_user(self, login_in: UserLogin) -> Token:
        """Authenticate user credentials and issue JWT token pair."""
        user = await self.user_repo.get_by_email(login_in.email)
        if not user or not verify_password(login_in.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedException("User account is disabled")

        access_token = create_access_token(subject=user.uuid)
        refresh_token_str = create_refresh_token(subject=user.uuid)

        # Store refresh token in database
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.user_repo.create_refresh_token(
            user_id=user.id,
            token=refresh_token_str,
            expires_at=expires_at
        )

        return Token(
            access_token=access_token,
            refresh_token=refresh_token_str,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    async def refresh_access_token(self, refresh_token_str: str) -> Token:
        """Rotate tokens using a valid refresh token."""
        payload = decode_jwt_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")

        user_uuid = payload.get("sub")
        if not user_uuid:
            raise UnauthorizedException("Invalid token payload")

        token_record = await self.user_repo.get_refresh_token(refresh_token_str)
        if not token_record or token_record.revoked or token_record.expires_at < datetime.now(timezone.utc):
            raise UnauthorizedException("Refresh token is expired or revoked")

        user = await self.user_repo.get_by_uuid(user_uuid)
        if not user or not user.is_active:
            raise UnauthorizedException("User inactive or not found")

        # Revoke old refresh token
        await self.user_repo.revoke_refresh_token(refresh_token_str)

        # Issue new token pair
        new_access = create_access_token(subject=user.uuid)
        new_refresh = create_refresh_token(subject=user.uuid)

        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.user_repo.create_refresh_token(
            user_id=user.id,
            token=new_refresh,
            expires_at=expires_at
        )

        return Token(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    async def logout_user(self, refresh_token_str: str) -> bool:
        """Revoke session refresh token on logout."""
        return await self.user_repo.revoke_refresh_token(refresh_token_str)
