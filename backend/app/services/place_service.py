import re
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundException
from app.repositories.category_repository import CategoryRepository
from app.repositories.place_repository import PlaceRepository
from app.schemas.place import PlaceCreate, PlaceDetailResponse, PlaceResponse, PlaceUpdate


class PlaceService:
    """Tourist place management service."""

    def __init__(self, session: AsyncSession):
        self.place_repo = PlaceRepository(session)
        self.category_repo = CategoryRepository(session)

    def _generate_slug(self, name: str) -> str:
        """Helper generating unique slug."""
        slug = name.lower().strip()
        slug = re.sub(r'[^\w\s-]', '', slug)
        return re.sub(r'[\s_-]+', '-', slug)

    async def get_by_uuid(self, uuid_str: str) -> PlaceDetailResponse:
        """Get complete place details by public UUID."""
        place = await self.place_repo.get_by_uuid(uuid_str)
        if not place:
            raise EntityNotFoundException("Place", uuid_str)
        return PlaceDetailResponse.model_validate(place)

    async def get_by_slug(self, slug: str) -> PlaceDetailResponse:
        """Get place by URL slug."""
        place = await self.place_repo.get_by_slug(slug)
        if not place:
            raise EntityNotFoundException("Place", slug)
        return PlaceDetailResponse.model_validate(place)

    async def search_places(
        self,
        query: Optional[str] = None,
        category_id: Optional[int] = None,
        city: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[PlaceResponse]:
        """Search published places."""
        places = await self.place_repo.search_places(
            query=query,
            category_id=category_id,
            city=city,
            status="published",
            skip=skip,
            limit=limit
        )
        return [PlaceResponse.model_validate(p) for p in places]

    async def find_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 10.0,
        limit: int = 20
    ) -> List[PlaceResponse]:
        """Spatial nearby place search."""
        places = await self.place_repo.find_nearby(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            limit=limit
        )
        return [PlaceResponse.model_validate(p) for p in places]

    async def create_place(self, place_in: PlaceCreate, created_by_user_id: Optional[int] = None) -> PlaceDetailResponse:
        """Create new place entry."""
        cat = await self.category_repo.get_by_id(place_in.category_id)
        if not cat:
            raise EntityNotFoundException("Category", place_in.category_id)

        data = place_in.model_dump()
        data["slug"] = self._generate_slug(place_in.name)
        data["created_by"] = created_by_user_id
        data["status"] = "draft"
        data["source"] = "admin" if created_by_user_id else "osm"

        place = await self.place_repo.create(data)
        full_place = await self.place_repo.get_by_uuid(place.uuid)
        return PlaceDetailResponse.model_validate(full_place)

    async def update_place(self, uuid_str: str, place_in: PlaceUpdate) -> PlaceDetailResponse:
        """Update existing place attributes."""
        place = await self.place_repo.get_by_uuid(uuid_str)
        if not place:
            raise EntityNotFoundException("Place", uuid_str)

        data = place_in.model_dump(exclude_unset=True)
        if "name" in data and data["name"]:
            data["slug"] = self._generate_slug(data["name"])

        await self.place_repo.update(place, data)
        updated = await self.place_repo.get_by_uuid(uuid_str)
        return PlaceDetailResponse.model_validate(updated)
