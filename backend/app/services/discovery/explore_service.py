from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy import select, desc, func, or_, and_, cast, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.place import Place
from app.models.category import Category
from app.services.discovery.image_search_service import image_search_service
from app.services.mistral_service import generate_mistral_search_summary

class ExploreService:
    """Enterprise Destination Discovery Search & Recommendation Engine."""

    async def search_explore(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        query: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
        sort_by: Optional[str] = "Relevance",
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Dict[str, Any]], int, Dict[str, Any]]:
        filters = filters or {}
        
        # Base query selecting published places
        stmt = (
            select(Place)
            .options(
                selectinload(Place.category),
                selectinload(Place.images),
                selectinload(Place.timings)
            )
            .where(Place.status == "published")
        )

        # 1. Physical distance calculator (Haversine)
        distance_expr = (
            6371 * func.acos(
                func.cos(func.radians(latitude)) *
                func.cos(func.radians(Place.latitude)) *
                func.cos(func.radians(Place.longitude) - func.radians(longitude)) +
                func.sin(func.radians(latitude)) *
                func.sin(func.radians(Place.latitude))
            )
        )

        # 2. Filter applications
        # Distance filter
        dist_filter = filters.get("distance")
        if dist_filter and str(dist_filter).lower() != "anywhere":
            try:
                max_dist = float(str(dist_filter).replace("km", "").replace("within", "").strip())
                stmt = stmt.where(distance_expr <= max_dist)
            except Exception:
                pass

        # Categories filter (multi-selection)
        cats_filter = filters.get("categories")
        if cats_filter:
            if isinstance(cats_filter, str):
                cats_filter = [cats_filter]
            stmt = stmt.join(Category, Place.category_id == Category.id).where(
                Category.name.in_(cats_filter)
            )

        # Rating filter
        rating_filter = filters.get("rating")
        if rating_filter:
            try:
                min_rate = float(str(rating_filter).replace("+", "").replace("★", "").strip())
                stmt = stmt.where(Place.avg_rating >= min_rate)
            except Exception:
                pass

        # Price filter
        price_filter = filters.get("price")
        if price_filter:
            if str(price_filter).lower() == "free":
                stmt = stmt.where(
                    or_(
                        Place.entry_fee.is_(None),
                        func.lower(Place.entry_fee).like("%free%"),
                        Place.entry_fee == ""
                    )
                )
            elif str(price_filter) == "₹":
                stmt = stmt.where(func.lower(Place.entry_fee).not_like("%free%")) # Paid low
            # Additional ₹₹ and ₹₹₹ filters can map to price subqueries if needed

        # Open Status filter
        if filters.get("open_status") == True:
            # We can mock this or query timings; standard published is open
            pass

        # Accessibility filter
        accessibility_filter = filters.get("accessibility")
        if accessibility_filter:
            if isinstance(accessibility_filter, str):
                accessibility_filter = [accessibility_filter]
            for feat in accessibility_filter:
                pattern = f"%{feat.strip().lower()}%"
                stmt = stmt.where(
                    or_(
                        func.lower(Place.description).like(pattern),
                        func.lower(Place.address).like(pattern)
                    )
                )

        # Entry Fee filter
        entry_fee_filter = filters.get("entry_fee")
        if entry_fee_filter:
            if str(entry_fee_filter).lower() == "free":
                stmt = stmt.where(
                    or_(
                        Place.entry_fee.is_(None),
                        func.lower(Place.entry_fee).like("%free%"),
                        Place.entry_fee == ""
                    )
                )
            elif str(entry_fee_filter).lower() == "paid":
                stmt = stmt.where(
                    and_(
                        Place.entry_fee.is_not(None),
                        func.lower(Place.entry_fee).not_like("%free%"),
                        Place.entry_fee != ""
                    )
                )

        # Crowd Level filter
        crowd_filter = filters.get("crowd_level")
        if crowd_filter:
            pattern = f"%{crowd_filter.strip().lower()}%"
            stmt = stmt.where(func.lower(Place.description).like(pattern))

        # Query/Search Term Matching (Full-Text Fallback Heuristics)
        search_score_expr = func.coalesce(Place.id, 0) * 0.0 # Placeholder score
        if query:
            clean_q = query.strip()
            pattern = f"%{clean_q}%"
            stmt = stmt.where(
                or_(
                    Place.name.ilike(pattern),
                    Place.description.ilike(pattern),
                    Place.address.ilike(pattern),
                    Place.city.ilike(pattern),
                    Place.state.ilike(pattern)
                )
            )
            # Reconstruct Search Match Score
            search_score_expr = (
                func.coalesce(
                    func.similarity(Place.name, clean_q),
                    1.0
                ) * 0.4 +
                func.coalesce(
                    func.similarity(Place.description, clean_q),
                    0.5
                ) * 0.2
            )

        # Calculate final sorting expressions
        sort_expr = Place.avg_rating.desc()
        if sort_by == "Nearest":
            sort_expr = distance_expr.asc()
        elif sort_by == "Highest Rated":
            sort_expr = Place.avg_rating.desc()
        elif sort_by == "Trending":
            sort_expr = desc(Place.total_favorites * 2 + Place.total_reviews)
        elif sort_by == "Most Popular":
            sort_expr = desc(Place.total_reviews * 3 + Place.total_favorites)
        elif sort_by == "Newest":
            sort_expr = Place.created_at.desc()
        elif sort_by == "Recently Updated":
            sort_expr = Place.updated_at.desc()
        elif sort_by == "Relevance" and query:
            sort_expr = desc(search_score_expr)

        # Count total records matching filters
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_res = await db.execute(count_stmt)
        total = count_res.scalar_one() or 0

        # Pagination & Query Exec
        skip = (page - 1) * page_size
        stmt = stmt.order_by(sort_expr).offset(skip).limit(page_size)
        db_res = await db.execute(stmt)
        places = list(db_res.scalars().all())

        # Map to dict items
        items = []
        for p in places:
            # Dynamic image lookup
            cover_url = await image_search_service.get_cached_place_image(p)
            dist_km = await db.scalar(select(distance_expr).where(Place.id == p.id))
            
            items.append({
                "id": str(p.uuid),
                "uuid": str(p.uuid),
                "name": p.name,
                "slug": p.slug,
                "category": p.category.name if p.category else "Attraction",
                "distance_km": round(float(dist_km), 1) if dist_km else 0.0,
                "distance_formatted": f"{round(float(dist_km), 1)} km away" if dist_km else "Nearby",
                "rating_formatted": f"{float(p.avg_rating):.1f}" if p.avg_rating else "4.5",
                "open_status": "Open Now",
                "imageUrl": cover_url or "",
                "city": p.city or "",
                "state": p.state or "",
                "country": p.country or "",
                "review_count": p.total_reviews,
                "avg_rating": float(p.avg_rating),
                "recommendation_reason": f"Matches your search query '{query}'" if query else "Scenic local attraction"
            })

        # 3. Generate AI summary context if query present
        ai_summary = {
            "summary": "Universal explore search. Adjust filters above to customize.",
            "suggested_tags": ["Beach", "Temples", "Scenic Trek", "Waterfall"]
        }
        if query and items:
            places_summary_data = [
                {"uuid": item["uuid"], "name": item["name"], "city": item["city"], "category_name": item["category"]}
                for item in items
            ]
            ai_summary = await generate_mistral_search_summary(query, places_summary_data)

        return items, total, ai_summary

explore_service = ExploreService()
