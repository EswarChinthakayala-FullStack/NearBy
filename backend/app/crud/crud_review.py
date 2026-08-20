from decimal import Decimal
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.crud.base import CRUDBase
from app.models.place import Place
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate


class CRUDReview(CRUDBase[Review, ReviewCreate, ReviewUpdate]):
    """Review repository handling review submissions, moderation, and atomic rating recalculations."""

    async def get_by_uuid(self, db: AsyncSession, uuid: str) -> Optional[Review]:
        """Fetch review by public UUID with eager loaded user, place, and images."""
        stmt = (
            select(Review)
            .options(
                selectinload(Review.user),
                selectinload(Review.images),
                selectinload(Review.place).selectinload(Place.category),
                selectinload(Review.place).selectinload(Place.images)
            )
            .where(Review.uuid == uuid)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_place_reviews(
        self,
        db: AsyncSession,
        place_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> List[Review]:
        """Fetch approved reviews for a tourist place with pagination."""
        stmt = (
            select(Review)
            .options(
                selectinload(Review.user),
                selectinload(Review.images),
                selectinload(Review.place).selectinload(Place.category)
            )
            .where(Review.place_id == place_id)
            .where(Review.status == "approved")
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_user_reviews(
        self,
        db: AsyncSession,
        user_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> List[Review]:
        """Fetch all reviews submitted by specific user with eager loaded place and images."""
        stmt = (
            select(Review)
            .options(
                selectinload(Review.user),
                selectinload(Review.images),
                selectinload(Review.place).selectinload(Place.category),
                selectinload(Review.place).selectinload(Place.images)
            )
            .where(Review.user_id == user_id)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_user_reviews_count(self, db: AsyncSession, user_id: int) -> int:
        """Get total count of reviews written by user."""
        stmt = select(func.count(Review.id)).where(Review.user_id == user_id)
        res = await db.execute(stmt)
        return res.scalar_one() or 0

    async def get_user_review_for_place(
        self,
        db: AsyncSession,
        user_id: int,
        place_id: int
    ) -> Optional[Review]:
        """Check if user has already submitted a review for target place."""
        stmt = (
            select(Review)
            .where(Review.user_id == user_id)
            .where(Review.place_id == place_id)
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def recalculate_place_rating(self, db: AsyncSession, place_id: int) -> None:
        """Recalculate avg_rating and total_reviews for place from approved reviews inside transaction."""
        stats_stmt = (
            select(
                func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
                func.count(Review.id).label("total_reviews")
            )
            .where(Review.place_id == place_id)
            .where(Review.status == "approved")
        )
        stats_res = await db.execute(stats_stmt)
        row = stats_res.first()

        avg_val = Decimal(str(round(row.avg_rating, 2))) if row else Decimal("0.00")
        total_val = row.total_reviews if row else 0

        place_stmt = select(Place).where(Place.id == place_id)
        place_res = await db.execute(place_stmt)
        place = place_res.scalars().first()

        if place:
            place.avg_rating = avg_val
            place.total_reviews = total_val
            db.add(place)

    async def create_review(
        self,
        db: AsyncSession,
        user_id: int,
        place_id: int,
        review_in: ReviewCreate
    ) -> Review:
        """Create a new user review and auto-recalculate place rating metrics."""
        review = Review(
            user_id=user_id,
            place_id=place_id,
            rating=review_in.rating,
            comment=review_in.comment,
            status="approved"
        )
        db.add(review)
        await db.flush()

        # Recalculate place metrics
        await self.recalculate_place_rating(db, place_id=place_id)
        await db.commit()
        await db.refresh(review)
        return review

    async def moderate_review(
        self,
        db: AsyncSession,
        review_id: int,
        status: str
    ) -> Optional[Review]:
        """Moderate a review status (approved / rejected) and update place rating metrics."""
        stmt = select(Review).where(Review.id == review_id)
        res = await db.execute(stmt)
        review = res.scalars().first()

        if not review:
            return None

        review.status = status
        db.add(review)
        await db.flush()

        # Recalculate rating metrics for place
        await self.recalculate_place_rating(db, place_id=review.place_id)
        await db.commit()
        await db.refresh(review)
        return review


crud_review = CRUDReview(Review)
