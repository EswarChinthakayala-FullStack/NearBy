from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import DuplicateEntityException, EntityNotFoundException
from app.repositories.place_repository import PlaceRepository
from app.repositories.review_repository import ReviewRepository
from app.repositories.user_repository import UserRepository
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate


class ReviewService:
    """Review and rating service."""

    def __init__(self, session: AsyncSession):
        self.review_repo = ReviewRepository(session)
        self.place_repo = PlaceRepository(session)
        self.user_repo = UserRepository(session)

    async def get_place_reviews(self, place_uuid: str, skip: int = 0, limit: int = 20) -> List[ReviewResponse]:
        """Fetch approved reviews for a place."""
        place = await self.place_repo.get_by_uuid(place_uuid)
        if not place:
            raise EntityNotFoundException("Place", place_uuid)

        reviews = await self.review_repo.get_by_place(place_id=place.id, status="approved", skip=skip, limit=limit)
        return [ReviewResponse.model_validate(r) for r in reviews]

    async def add_review(self, user_uuid: str, review_in: ReviewCreate) -> ReviewResponse:
        """Post user review on a place."""
        user = await self.user_repo.get_by_uuid(user_uuid)
        if not user:
            raise EntityNotFoundException("User", user_uuid)

        place = await self.place_repo.get_by_uuid(review_in.place_uuid)
        if not place:
            raise EntityNotFoundException("Place", review_in.place_uuid)

        existing = await self.review_repo.get_by_user_and_place(user.id, place.id)
        if existing:
            raise DuplicateEntityException("Review", "user and place", f"{user_uuid}:{review_in.place_uuid}")

        data = {
            "user_id": user.id,
            "place_id": place.id,
            "rating": review_in.rating,
            "comment": review_in.comment,
            "status": "pending"  # Requires moderation
        }

        review = await self.review_repo.create(data)
        full_review = await self.review_repo.get_by_uuid(review.uuid)
        return ReviewResponse.model_validate(full_review)
