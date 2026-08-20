from datetime import datetime
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, RefreshToken
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """User-specific repository for database queries."""

    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user by unique email address."""
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalars().first()

    async def get_by_uuid(self, uuid_str: str) -> Optional[User]:
        """Fetch user by public UUID."""
        result = await self.session.execute(
            select(User).where(User.uuid == uuid_str)
        )
        return result.scalars().first()

    async def create_refresh_token(self, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
        """Persist a newly issued refresh token."""
        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
            revoked=False
        )
        self.session.add(refresh_token)
        await self.session.flush()
        await self.session.refresh(refresh_token)
        return refresh_token

    async def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        """Fetch active refresh token details."""
        result = await self.session.execute(
            select(RefreshToken).where(RefreshToken.token == token)
        )
        return result.scalars().first()

    async def revoke_refresh_token(self, token: str) -> bool:
        """Revoke a refresh token."""
        result = await self.session.execute(
            update(RefreshToken)
            .where(RefreshToken.token == token)
            .values(revoked=True)
        )
        return result.rowcount > 0
