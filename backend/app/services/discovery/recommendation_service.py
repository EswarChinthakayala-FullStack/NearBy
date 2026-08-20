import math
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.place import Place
from app.models.user import User
from app.models.favorite import Favorite
from app.models.review import Review
from app.services.weather.weather_service import weather_service

logger = logging.getLogger(__name__)

class RecommendationService:
    """Personalized Recommendation Engine combining user interests, geography, and weather."""

    async def get_recommendations(
        self,
        db: AsyncSession,
        current_user: Optional[User],
        latitude: float,
        longitude: float,
        page: int = 1,
        page_size: int = 20,
        query_str: Optional[str] = None,
        category: Optional[str] = None,
        min_rating: Optional[float] = None,
        open_now: Optional[bool] = None
    ) -> List[Place]:
        # 1. Resolve user profile preferences
        preferred_category_ids = set()
        if current_user:
            # Query categories of user's favorited places
            fav_stmt = select(Place.category_id).join(Favorite, Place.id == Favorite.place_id).where(Favorite.user_id == current_user.id)
            fav_res = await db.execute(fav_stmt)
            preferred_category_ids.update(fav_res.scalars().all())

            # Query categories of user's high-rated reviews
            rev_stmt = select(Place.category_id).join(Review, Place.id == Review.place_id).where(Review.user_id == current_user.id, Review.rating >= 4)
            rev_res = await db.execute(rev_stmt)
            preferred_category_ids.update(rev_res.scalars().all())

        # 2. Get weather context
        weather_condition = "Clear"
        if latitude != 0.0 and longitude != 0.0:
            try:
                w = await weather_service.get_weather_forecast(latitude, longitude)
                weather_condition = w.get("condition", "Clear")
            except Exception:
                pass

        # 3. Query candidates within 200 km
        stmt = (
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.images),
                selectinload(Place.timings)
            )
            .where(Place.status == "published")
        )

        if latitude != 0.0 and longitude != 0.0:
            lat_delta = 1.8  # ~200 km
            lon_delta = 2.2
            stmt = stmt.where(
                Place.latitude.between(latitude - lat_delta, latitude + lat_delta),
                Place.longitude.between(longitude - lon_delta, longitude + lon_delta)
            )

        if query_str:
            stmt = stmt.where(Place.name.ilike(f"%{query_str}%"))

        if category and category != "All":
            from app.models.category import Category
            stmt = stmt.join(Category, Place.category_id == Category.id).where(Category.name.ilike(category))

        if min_rating:
            stmt = stmt.where(Place.avg_rating >= min_rating)

        res = await db.execute(stmt)
        candidates = list(res.scalars().all())

        # 4. Rank in Python using multi-tiered formula
        scored_places = []
        is_rainy = "rain" in weather_condition.lower() or "shower" in weather_condition.lower()

        for p in candidates:
            p_lat = float(p.latitude)
            p_lon = float(p.longitude)

            # Haversine distance
            dist = 6371.0 * math.acos(
                min(1.0,
                    math.cos(math.radians(latitude)) *
                    math.cos(math.radians(p_lat)) *
                    math.cos(math.radians(p_lon) - math.radians(longitude)) +
                    math.sin(math.radians(latitude)) *
                    math.sin(math.radians(p_lat))
                )
            ) if latitude != 0.0 else 50.0

            # Score calculations:
            # Preference match: +15 if category matches user's history
            pref_score = 15.0 if p.category_id in preferred_category_ids else 0.0

            # Distance decay: score drops off exponential
            dist_score = 15.0 * math.exp(-dist / 30.0)

            # Weather match: outdoor categories penalized on rainy days, indoor boosted
            weather_score = 10.0
            cat_name = p.category.name.lower() if p.category else ""
            if is_rainy:
                if any(x in cat_name for x in ["beach", "park", "waterfall", "nature"]):
                    weather_score = 0.0
                elif any(x in cat_name for x in ["museum", "historical", "temple"]):
                    weather_score = 15.0

            # Rating quality
            rating_score = (float(p.avg_rating) if p.avg_rating else 0.0) * 3.0

            # Total score
            total_score = pref_score + dist_score + weather_score + rating_score

            # Build semantic reason
            reason_parts = []
            if pref_score > 0:
                reason_parts.append(f"matches your interest in {p.category.name}")
            if is_rainy and weather_score >= 15.0:
                reason_parts.append("perfect indoor escape for today's weather")
            elif dist < 10.0:
                reason_parts.append("exceptionally close to you")
            else:
                reason_parts.append(f"highly-rated spot in {p.city or 'your region'}")

            reason = "Recommended because it " + " and ".join(reason_parts) + "."

            # Attach dynamically to the Place object or save for serialization
            p._recommendation_reason = reason
            scored_places.append((total_score, p))

        # Sort by score desc
        scored_places.sort(key=lambda x: x[0], reverse=True)

        # Slice for pagination
        offset = (page - 1) * page_size
        paginated_places = [item[1] for item in scored_places[offset:offset + page_size]]

        return paginated_places

recommendation_service = RecommendationService()
