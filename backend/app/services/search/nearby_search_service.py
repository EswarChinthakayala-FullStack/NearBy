import math
import re
import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.models.place import Place
from app.models.category import Category
from app.utils.image_helpers import get_place_cover_image
from app.services.search.intent_analysis_service import intent_analysis_service
from app.services.search.category_resolver_service import category_resolver_service

logger = logging.getLogger(__name__)

STOP_WORDS = {"best", "top", "near", "me", "show", "find", "the", "a", "an", "in", "around", "good", "places", "place", "spot", "spots", "location"}

def extract_query_keywords(query: str) -> List[str]:
    """Extract clean search terms stripping punctuation and stop words."""
    clean = re.sub(r'[^\w\s]', '', query.lower())
    words = [w.strip() for w in clean.split() if len(w.strip()) > 2]
    keywords = [w for w in words if w not in STOP_WORDS]
    return keywords if keywords else words

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate geographic distance between two coordinates in kilometers using Haversine formula."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class NearbySearchService:
    """Enterprise AI Search Engine with progressive radius expansion & hybrid intent ranking."""

    async def search_nearby(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        query: str,
        radius_km: float = 50.0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:

        # 1. Natural Language Intent Analysis
        intent_info = intent_analysis_service.analyze_intent(query)
        primary_cat = intent_info["primary_category"]
        secondary_cats = intent_info["secondary_categories"]
        excluded_cats = intent_info["excluded_categories"]
        keywords = extract_query_keywords(query)

        # 2. Fetch published places from DB
        stmt = (
            select(Place)
            .options(selectinload(Place.category), selectinload(Place.images))
            .where(Place.status == "published")
        )
        result = await db.execute(stmt)
        all_places = result.scalars().all()

        # 3. Radius Expansion Strategy: 5km -> 10km -> 20km -> 35km -> 50km
        radius_steps = [5.0, 10.0, 20.0, 35.0, 50.0]
        step_candidates = []

        for step_r in radius_steps:
            matched_places = []
            for p in all_places:
                p_lat = float(p.latitude)
                p_lng = float(p.longitude)
                dist = haversine_distance_km(latitude, longitude, p_lat, p_lng)

                if dist > step_r:
                    continue

                cat_name = p.category.name if p.category else "Attraction"

                # Check strict exclusions
                if category_resolver_service.is_excluded(cat_name, excluded_cats):
                    continue

                matched_places.append((p, dist, cat_name))

            # Stop expanding radius if we have enough relevant candidates
            if len(matched_places) >= 10 or step_r == radius_steps[-1]:
                step_candidates = matched_places
                break

        # Fallback if strict filtering returned no candidates
        if not step_candidates:
            step_candidates = [
                (p, haversine_distance_km(latitude, longitude, float(p.latitude), float(p.longitude)), p.category.name if p.category else "Attraction")
                for p in all_places
            ]

        # 4. Compute Hybrid Intent Score
        candidates = []
        for p, dist, cat_name in step_candidates:
            # A. Intent Match Score (40%)
            intent_score = 0.0
            if primary_cat.lower() in cat_name.lower() or cat_name.lower() in primary_cat.lower():
                intent_score = 40.0
            elif any(sc.lower() in cat_name.lower() for sc in secondary_cats):
                intent_score = 25.0

            # B. Category Match Score (25%)
            cat_score = 0.0
            for kw in keywords:
                if kw in cat_name.lower():
                    cat_score += 12.5
            cat_score = min(25.0, cat_score)

            # C. Keyword/Text Similarity (15%)
            kw_score = 0.0
            text_corpus = f"{p.name} {p.description or ''} {p.city or ''}".lower()
            for kw in keywords:
                if kw in p.name.lower():
                    kw_score += 10.0
                elif kw in text_corpus:
                    kw_score += 5.0
            kw_score = min(15.0, kw_score)

            # D. Rating Score (8%)
            rating_val = float(p.avg_rating) if p.avg_rating else 4.0
            rating_score = (rating_val / 5.0) * 8.0

            # E. Popularity Score (5%)
            pop_val = p.popularity_score if hasattr(p, 'popularity_score') and p.popularity_score else 50
            pop_score = (min(100, pop_val) / 100.0) * 5.0

            # F. Review Count Score (3%)
            reviews = p.total_reviews if p.total_reviews else 1
            review_score = min(3.0, (reviews / 50.0) * 3.0)

            # G. Distance Score (4%) - Proximity only counts for 4%!
            dist_score = max(0.0, 4.0 - (dist / 50.0) * 4.0)

            total_hybrid_score = round(intent_score + cat_score + kw_score + rating_score + pop_score + review_score + dist_score, 2)
            confidence = min(99, int(round(total_hybrid_score)))

            cover_img = get_place_cover_image(p)

            candidates.append({
                "uuid": p.uuid,
                "name": p.name,
                "slug": p.slug,
                "category_name": cat_name,
                "city": p.city or "Local Area",
                "latitude": float(p.latitude),
                "longitude": float(p.longitude),
                "distance_km": dist,
                "rating": float(p.avg_rating),
                "total_reviews": p.total_reviews,
                "cover_image": cover_img,
                "description": p.description or "",
                "hybrid_score": total_hybrid_score,
                "confidence": confidence
            })

        # Sort candidates by total_hybrid_score descending
        candidates.sort(key=lambda x: -x["hybrid_score"])
        return candidates[:limit]

nearby_search_service = NearbySearchService()
