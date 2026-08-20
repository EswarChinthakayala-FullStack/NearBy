from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundException
from app.repositories.favorite_repository import FavoriteRepository
from app.repositories.place_repository import PlaceRepository
from app.repositories.user_repository import UserRepository
from app.schemas.favorite import FavoriteResponse


class FavoriteService:
    """User favorites and bookmarking service."""

    def __init__(self, session: AsyncSession):
        self.favorite_repo = FavoriteRepository(session)
        self.place_repo = PlaceRepository(session)
        self.user_repo = UserRepository(session)

    async def get_user_favorites(self, user_uuid: str, skip: int = 0, limit: int = 20) -> List[FavoriteResponse]:
        """Fetch bookmarked places for a user."""
        user = await self.user_repo.get_by_uuid(user_uuid)
        if not user:
            raise EntityNotFoundException("User", user_uuid)

        favorites = await self.favorite_repo.get_by_user(user.id, skip=skip, limit=limit)
        return [FavoriteResponse.model_validate(f) for f in favorites]

    async def toggle_favorite(self, user_uuid: str, place_uuid: str) -> bool:
        """Toggle favorite bookmark state. Returns True if added, False if removed."""
        user = await self.user_repo.get_by_uuid(user_uuid)
        if not user:
            raise EntityNotFoundException("User", user_uuid)

        place = await self.place_repo.get_by_uuid(place_uuid)
        if not place:
            raise EntityNotFoundException("Place", place_uuid)

        existing = await self.favorite_repo.get_by_user_and_place(user.id, place.id)
        if existing:
            await self.favorite_repo.delete_by_user_and_place(user.id, place.id)
            return False
        else:
            await self.favorite_repo.create({"user_id": user.id, "place_id": place.id})
            return True
