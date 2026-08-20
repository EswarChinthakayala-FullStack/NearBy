import math
import logging
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.place import Place
from app.models.category import Category
from app.models.favorite import Favorite
from app.schemas.common import ResponseModel, PaginatedResponse, PaginationMeta
from app.api.deps import get_current_user_optional, get_current_active_user
from app.services.location.reverse_geocoder import reverse_geocoder
from app.services.weather.weather_service import weather_service

from app.services.discovery.trending_service import trending_service
from app.services.discovery.recommendation_service import recommendation_service
from app.services.discovery.popularity_service import popularity_service
from app.services.discovery.nearby_attractions_service import nearby_attractions_service
from app.services.discovery.image_search_service import image_search_service

logger = logging.getLogger(__name__)

router = APIRouter()

# ──────────────────────────────────────────────────────────────
# Response Schemas
# ──────────────────────────────────────────────────────────────
class LocationContextResponse(BaseModel):
    village: str = ""
    town: str = ""
    city: str = ""
    district: str = ""
    state: str = ""
    country: str = ""
    locality: str = ""
    formatted_address: str = ""

class HomeWeatherResponse(BaseModel):
    temperature_c: float = 26.0
    condition: str = "Clear & Pleasant"
    humidity_pct: int = 60
    rain_probability_pct: int = 10
    recommendation: str = "Great weather for outdoor activities."

class HomeCategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    icon: str
    count: int

class HomePlaceResponse(BaseModel):
    id: str
    uuid: str
    name: str
    slug: str
    category: str
    city: str
    state: str
    country: str
    rating: float
    review_count: int
    image_url: Optional[str] = None
    open_status: str = ""
    distance_km: Optional[float] = None
    is_favorite: bool = False
    recommendation_reason: Optional[str] = None

class HomeBannerResponse(BaseModel):
    id: str
    title: str
    subtitle: str
    image_url: str
    category_slug: Optional[str] = None

class HomeDashboardResponse(BaseModel):
    user_greeting: str
    user_name: str
    user_avatar: Optional[str] = None
    location_name: str
    location: LocationContextResponse
    weather: Optional[HomeWeatherResponse] = None
    trending: List[HomePlaceResponse]
    nearby: List[HomePlaceResponse]
    recommended: List[HomePlaceResponse]
    popular: List[HomePlaceResponse]
    categories: List[HomeCategoryResponse]
    banners: List[HomeBannerResponse]

# Request Body
class DashboardRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────
def generate_greeting() -> str:
    hour = datetime.now().hour
    if 5 <= hour < 12:
        return "Good Morning"
    elif 12 <= hour < 17:
        return "Good Afternoon"
    elif 17 <= hour < 22:
        return "Good Evening"
    else:
        return "Good Night"

CATEGORY_ICON_MAP = {
    "Historical": "🏛️",
    "Temple": "⛩️",
    "Forts": "🏰",
    "Parks & Nature": "🌳",
    "Museums": "🎨",
    "Markets": "🛍️",
    "Waterfalls": "🌊",
    "Lakes": "⛵",
    "Beaches": "🏖️",
    "Wildlife": "🦁",
    "Viewpoints": "🏔️",
    "Gardens": "🌺",
    "Religious": "🕌",
    "Adventure": "🧗",
}

async def build_place_response(
    place: Place,
    user_lat: float,
    user_lon: float,
    user_fav_ids: set,
    reason: Optional[str] = None
) -> HomePlaceResponse:
    """Convert a Place ORM object to a HomePlaceResponse with live cached image search."""
    p_lat = float(place.latitude)
    p_lon = float(place.longitude)
    
    # Calculate Haversine distance
    dist = 50.0
    if user_lat != 0.0 or user_lon != 0.0:
        try:
            r = 6371.0
            dlat = math.radians(p_lat - user_lat)
            dlon = math.radians(p_lon - user_lon)
            a = (
                math.sin(dlat / 2.0) ** 2
                + math.cos(math.radians(user_lat))
                * math.cos(math.radians(p_lat))
                * math.sin(dlon / 2.0) ** 2
            )
            c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
            dist = round(r * c, 1)
        except Exception:
            pass

    # Resolve cached cover image
    img = await image_search_service.get_cached_place_image(place)

    open_status = ""
    if getattr(place, "timings", None):
        today_name = datetime.now().strftime("%A")
        for t in place.timings:
            day = getattr(t, "day", None) or getattr(t, "day_of_week", None)
            if day and day.lower() == today_name.lower():
                open_time = getattr(t, "open_time", None) or getattr(t, "opening_time", None)
                close_time = getattr(t, "close_time", None) or getattr(t, "closing_time", None)
                if open_time and close_time:
                    open_status = f"Open Today ({open_time} - {close_time})"
                elif getattr(t, "is_closed", False):
                    open_status = "Closed Today"
                break

    return HomePlaceResponse(
        id=str(place.id),
        uuid=place.uuid or str(place.id),
        name=place.name,
        slug=place.slug or f"place-{place.id}",
        category=place.category.name if place.category else "",
        city=place.city or "",
        state=place.state or "",
        country=place.country or "",
        rating=float(place.avg_rating) if place.avg_rating else 0.0,
        review_count=place.total_reviews or 0,
        image_url=img,
        open_status=open_status,
        distance_km=dist,
        is_favorite=place.id in user_fav_ids,
        recommendation_reason=reason
    )

# ──────────────────────────────────────────────────────────────
# POST /dashboard — GPS-first, location-aware dashboard merge
# ──────────────────────────────────────────────────────────────
@router.post("/dashboard", response_model=ResponseModel[HomeDashboardResponse])
async def get_home_dashboard(
    body: DashboardRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    latitude = body.latitude
    longitude = body.longitude

    greeting = generate_greeting()
    name = current_user.full_name if current_user else "Traveler"
    avatar = current_user.avatar_url if current_user else None

    # 1. Reverse Geocode
    try:
        geo = await reverse_geocoder.reverse_geocode(latitude, longitude)
    except Exception as e:
        logger.warning(f"Reverse geocode failed for ({latitude}, {longitude}): {e}")
        geo = {}

    loc_parts = []
    if geo.get("village"):
        loc_parts.append(geo["village"])
    if geo.get("town") and geo["town"] not in loc_parts:
        loc_parts.append(geo["town"])
    if geo.get("city") and geo["city"] not in loc_parts:
        loc_parts.append(geo["city"])
    if not loc_parts and geo.get("district"):
        loc_parts.append(geo["district"])
    if geo.get("state") and geo["state"] not in loc_parts:
        loc_parts.append(geo["state"])
    location_name = ", ".join(loc_parts[:2]) if loc_parts else f"Location ({latitude:.3f}, {longitude:.3f})"

    location_context = LocationContextResponse(
        village=geo.get("village", ""),
        town=geo.get("town", ""),
        city=geo.get("city", ""),
        district=geo.get("district", ""),
        state=geo.get("state", ""),
        country=geo.get("country", ""),
        locality=geo.get("locality", ""),
        formatted_address=geo.get("formatted_address", "")
    )

    # 2. Call the four discovery engines sequentially to be database session-safe
    nearby_places = await nearby_attractions_service.get_nearby(db, latitude, longitude, page=1, page_size=10)
    trending_places = await trending_service.get_trending(db, latitude, longitude, page=1, page_size=10)
    recommended_places = await recommendation_service.get_recommendations(db, current_user, latitude, longitude, page=1, page_size=10)
    popular_places = await popularity_service.get_popular(db, latitude, longitude, page=1, page_size=10)

    # 3. Build responses concurrently with dynamic favorite lookup
    user_fav_ids = set()
    if current_user:
        fav_stmt = select(Favorite.place_id).where(Favorite.user_id == current_user.id)
        fav_res = await db.execute(fav_stmt)
        user_fav_ids = set(fav_res.scalars().all())

    nearby_list = await asyncio.gather(*[build_place_response(p, latitude, longitude, user_fav_ids) for p in nearby_places])
    trending_list = await asyncio.gather(*[build_place_response(p, latitude, longitude, user_fav_ids, "Trending near your location") for p in trending_places])
    recommended_list = await asyncio.gather(*[build_place_response(p, latitude, longitude, user_fav_ids, getattr(p, "_recommendation_reason", "Recommended for you")) for p in recommended_places])
    popular_list = await asyncio.gather(*[build_place_response(p, latitude, longitude, user_fav_ids, "Popular destination") for p in popular_places])

    # 4. Categories count
    cat_query = (
        select(
            Category.id,
            Category.name,
            Category.slug,
            func.count(Place.id).label("place_count")
        )
        .outerjoin(Place, (Place.category_id == Category.id) & (Place.status == "published"))
        .group_by(Category.id, Category.name, Category.slug)
        .order_by(desc("place_count"))
    )
    cat_res = await db.execute(cat_query)
    categories_rows = cat_res.all()

    cats_output = [
        HomeCategoryResponse(
            id=str(row.id),
            name=row.name,
            slug=row.slug,
            icon=CATEGORY_ICON_MAP.get(row.name, "📍"),
            count=row.place_count or 0
        )
        for row in categories_rows
    ]

    # 5. Weather Context
    try:
        w = await weather_service.get_weather_forecast(latitude, longitude)
        weather_resp = HomeWeatherResponse(
            temperature_c=float(w.get("temperature_c", 26.0)),
            condition=str(w.get("condition", "Clear & Pleasant")),
            humidity_pct=int(w.get("humidity_pct", 60)),
            rain_probability_pct=int(w.get("rain_probability_pct", 10)),
            recommendation=str(w.get("recommendation", "Great weather for outdoor exploration."))
        )
    except Exception:
        weather_resp = HomeWeatherResponse()

    # 6. Banners
    loc_label = geo.get("village") or geo.get("city") or geo.get("district") or geo.get("state") or "your area"
    banners_output = [
        HomeBannerResponse(
            id="1",
            title=f"Discover Places Near {loc_label}",
            subtitle=f"Explore top-rated attractions and hidden gems around {loc_label}",
            image_url="https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200",
            category_slug="nature"
        ),
        HomeBannerResponse(
            id="2",
            title="Heritage & Architecture",
            subtitle="Journey through historic palaces and ancient monuments",
            image_url="https://images.unsplash.com/photo-1548013146-72479768bada?w=1200",
            category_slug="historical"
        )
    ]

    return ResponseModel[HomeDashboardResponse](
        success=True,
        message=f"Home dashboard for {location_name}.",
        data=HomeDashboardResponse(
            user_greeting=f"{greeting},",
            user_name=name,
            user_avatar=avatar,
            location_name=location_name,
            location=location_context,
            weather=weather_resp,
            trending=trending_list,
            nearby=nearby_list,
            recommended=recommended_list,
            popular=popular_list,
            categories=cats_output,
            banners=banners_output
        )
    )

# Backward compat
@router.get("/dashboard", response_model=ResponseModel[HomeDashboardResponse])
async def get_home_dashboard_compat(
    latitude: float = Query(0.0),
    longitude: float = Query(0.0),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    body = DashboardRequest(latitude=latitude, longitude=longitude)
    return await get_home_dashboard(body=body, db=db, current_user=current_user)

# ──────────────────────────────────────────────────────────────
# Dedicated Discovery Endpoints (Paginated & Filterable)
# ──────────────────────────────────────────────────────────────

@router.get("/trending", response_model=PaginatedResponse[HomePlaceResponse])
async def get_trending_places_endpoint(
    latitude: float = Query(0.0),
    longitude: float = Query(0.0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, alias="query"),
    category: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    open_now: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Fetch places
    places = await trending_service.get_trending(
        db, latitude, longitude, page, page_size, q, category, min_rating, open_now
    )
    
    # Count total
    from app.models.trending import TrendingMaterialized
    count_stmt = select(func.count(Place.id)).join(TrendingMaterialized, Place.id == TrendingMaterialized.place_id).where(Place.status == "published")
    if q:
        count_stmt = count_stmt.where(Place.name.ilike(f"%{q}%"))
    if category and category != "All":
        count_stmt = count_stmt.join(Category, Place.category_id == Category.id).where(Category.name.ilike(category))
    if min_rating:
        count_stmt = count_stmt.where(Place.avg_rating >= min_rating)
        
    count_res = await db.execute(count_stmt)
    total = count_res.scalar_one() or 0
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    user_fav_ids = set()
    if current_user:
        fav_stmt = select(Favorite.place_id).where(Favorite.user_id == current_user.id)
        fav_res = await db.execute(fav_stmt)
        user_fav_ids = set(fav_res.scalars().all())

    items = await asyncio.gather(*[build_place_response(p, latitude, longitude, user_fav_ids, "Trending near your location") for p in places])
    
    return PaginatedResponse[HomePlaceResponse](
        success=True,
        message="Trending places retrieved.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )

@router.get("/nearby", response_model=PaginatedResponse[HomePlaceResponse])
async def get_nearby_places_endpoint(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, alias="query"),
    category: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    open_now: Optional[bool] = Query(None),
    radius_km: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    places = await nearby_attractions_service.get_nearby(
        db, latitude, longitude, page, page_size, q, category, min_rating, open_now, radius_km
    )

    # Bounding box for count total
    count_stmt = select(func.count(Place.id)).where(Place.status == "published")
    if q:
        count_stmt = count_stmt.where(Place.name.ilike(f"%{q}%"))
    if category and category != "All":
        count_stmt = count_stmt.join(Category, Place.category_id == Category.id).where(Category.name.ilike(category))
    if min_rating:
        count_stmt = count_stmt.where(Place.avg_rating >= min_rating)

    count_res = await db.execute(count_stmt)
    total = count_res.scalar_one() or 0
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    user_fav_ids = set()
    if current_user:
        fav_stmt = select(Favorite.place_id).where(Favorite.user_id == current_user.id)
        fav_res = await db.execute(fav_stmt)
        user_fav_ids = set(fav_res.scalars().all())

    items = await asyncio.gather(*[build_place_response(p, latitude, longitude, user_fav_ids) for p in places])

    return PaginatedResponse[HomePlaceResponse](
        success=True,
        message="Nearby places retrieved.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )

@router.get("/recommended", response_model=PaginatedResponse[HomePlaceResponse])
async def get_recommended_places_endpoint(
    latitude: float = Query(0.0),
    longitude: float = Query(0.0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, alias="query"),
    category: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    open_now: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    places = await recommendation_service.get_recommendations(
        db, current_user, latitude, longitude, page, page_size, q, category, min_rating, open_now
    )

    # Count total
    count_stmt = select(func.count(Place.id)).where(Place.status == "published")
    if q:
        count_stmt = count_stmt.where(Place.name.ilike(f"%{q}%"))
    if category and category != "All":
        count_stmt = count_stmt.join(Category, Place.category_id == Category.id).where(Category.name.ilike(category))
    if min_rating:
        count_stmt = count_stmt.where(Place.avg_rating >= min_rating)

    count_res = await db.execute(count_stmt)
    total = count_res.scalar_one() or 0
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    user_fav_ids = set()
    if current_user:
        fav_stmt = select(Favorite.place_id).where(Favorite.user_id == current_user.id)
        fav_res = await db.execute(fav_stmt)
        user_fav_ids = set(fav_res.scalars().all())

    items = await asyncio.gather(*[build_place_response(p, latitude, longitude, user_fav_ids, getattr(p, "_recommendation_reason", "Recommended for you")) for p in places])

    return PaginatedResponse[HomePlaceResponse](
        success=True,
        message="Recommended places retrieved.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )

@router.get("/popular", response_model=PaginatedResponse[HomePlaceResponse])
async def get_popular_places_endpoint(
    latitude: float = Query(0.0),
    longitude: float = Query(0.0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, alias="query"),
    category: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    open_now: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    places = await popularity_service.get_popular(
        db, latitude, longitude, page, page_size, q, category, min_rating, open_now
    )

    count_stmt = select(func.count(Place.id)).where(Place.status == "published")
    if q:
        count_stmt = count_stmt.where(Place.name.ilike(f"%{q}%"))
    if category and category != "All":
        count_stmt = count_stmt.join(Category, Place.category_id == Category.id).where(Category.name.ilike(category))
    if min_rating:
        count_stmt = count_stmt.where(Place.avg_rating >= min_rating)

    count_res = await db.execute(count_stmt)
    total = count_res.scalar_one() or 0
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    user_fav_ids = set()
    if current_user:
        fav_stmt = select(Favorite.place_id).where(Favorite.user_id == current_user.id)
        fav_res = await db.execute(fav_stmt)
        user_fav_ids = set(fav_res.scalars().all())

    items = await asyncio.gather(*[build_place_response(p, latitude, longitude, user_fav_ids, "Popular destination") for p in places])

    return PaginatedResponse[HomePlaceResponse](
        success=True,
        message="Popular places retrieved.",
        data=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )

@router.get("/banner", response_model=ResponseModel[List[HomeBannerResponse]])
async def get_home_banners():
    banners_output = [
        HomeBannerResponse(
            id="1",
            title="Explore Nature's Hidden Treasures",
            subtitle="Discover scenic waterfalls, green valleys, and tranquil lakes",
            image_url="https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200",
            category_slug="nature"
        )
    ]
    return ResponseModel[List[HomeBannerResponse]](success=True, message="Banners.", data=banners_output)
