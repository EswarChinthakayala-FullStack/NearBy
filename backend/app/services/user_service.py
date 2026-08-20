from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundException
from app.core.security import get_password_hash
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse, UserUpdate


class UserService:
    """User profile management service."""

    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    async def get_by_uuid(self, uuid_str: str) -> UserResponse:
        """Get user by UUID."""
        user = await self.user_repo.get_by_uuid(uuid_str)
        if not user:
            raise EntityNotFoundException("User", uuid_str)
        return UserResponse.model_validate(user)

    async def update_profile(self, user_uuid: str, update_in: UserUpdate) -> UserResponse:
        """Update active user profile details."""
        user = await self.user_repo.get_by_uuid(user_uuid)
        if not user:
            raise EntityNotFoundException("User", user_uuid)

        update_data = update_in.model_dump(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))

        updated_user = await self.user_repo.update(user, update_data)
        return UserResponse.model_validate(updated_user)
