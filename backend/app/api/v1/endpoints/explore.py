from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_optional
from app.models.user import User
from app.models.favorite import Favorite
from app.models.place import Place
from sqlalchemy import select
from app.schemas.common import ResponseModel
from app.services.discovery.explore_service import explore_service

router = APIRouter()

class ExploreSearchFilters(BaseModel):
    distance: Optional[str] = Field(None, description="Distance threshold (e.g. 5 km, 10 km, Anywhere)")
    categories: Optional[List[str]] = Field(None, description="Categories list to filter by")
    rating: Optional[str] = Field(None, description="Rating filter (e.g. 4+, 4.5+)")
    price: Optional[str] = Field(None, description="Price tier indicator (Free, ₹, ₹₹, ₹₹₹)")
    open_status: Optional[bool] = Field(False, description="Filter for currently open places")
    accessibility: Optional[List[str]] = Field(None, description="Accessibility features list")
    travel_time: Optional[int] = Field(None, description="Travel time limit in minutes")
    entry_fee: Optional[str] = Field(None, description="Entry fee category filter (Free, Paid)")
    crowd_level: Optional[str] = Field(None, description="Crowd density filter (Quiet, Moderate, Busy)")

class ExploreSearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search term")
    latitude: float = Field(..., description="User latitude")
    longitude: float = Field(..., description="User longitude")
    filters: Optional[ExploreSearchFilters] = Field(None, description="Advanced filter parameters")
    sort_by: Optional[str] = Field("Relevance", description="Sort parameter (Relevance, Nearest, Highest Rated, Trending, Most Popular, Newest)")
    page: int = Field(1, ge=1, description="Page index")
    page_size: int = Field(20, ge=1, le=100, description="Page size limit")

class ExploreSearchItem(BaseModel):
    id: str
    uuid: str
    name: str
    slug: str
    category: str
    distance_km: float
    distance_formatted: str
    rating_formatted: str
    open_status: str
    imageUrl: str
    city: str
    state: str
    country: str
    review_count: int
    avg_rating: float
    is_favorite: bool = False
    recommendation_reason: Optional[str] = None

class ExploreSearchResponse(BaseModel):
    items: List[ExploreSearchItem]
    total: int
    page: int
    page_size: int
    total_pages: int
    summary: str
    suggested_tags: List[str]

@router.post(
    "/search",
    response_model=ResponseModel[ExploreSearchResponse],
    summary="Universal explore and destination search engine",
    description="Intelligent multi-criteria discovery engine combining full-text relevance, trigram similarity, PostGIS spatial queries, and AI-powered ranking."
)
async def search_explore(
    payload: ExploreSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    filters_dict = payload.filters.dict(exclude_none=True) if payload.filters else {}
    
    items, total, ai_summary = await explore_service.search_explore(
        db=db,
        latitude=payload.latitude,
        longitude=payload.longitude,
        query=payload.query,
        filters=filters_dict,
        sort_by=payload.sort_by,
        page=payload.page,
        page_size=payload.page_size
    )

    # Determine user-specific favorited state for each item in the results
    user_fav_ids = set()
    if current_user:
        fav_stmt = select(Favorite.place_id).where(Favorite.user_id == current_user.id)
        fav_res = await db.execute(fav_stmt)
        user_fav_ids = set(fav_res.scalars().all())

    # Map database place ORM IDs if favorited
    # In explore_service.py we fetched ORM Place objects, but items returned is already list of dicts.
    # To determine is_favorite, let's resolve it using the database place ID mapping or slug lookup.
    from app.crud.crud_place import crud_place
    place_ids_stmt = select(Place.id, Place.uuid).where(Place.uuid.in_([x["uuid"] for x in items]))
    p_ids_res = await db.execute(place_ids_stmt)
    uuid_to_id = {row[1]: row[0] for row in p_ids_res.all()}

    mapped_items = []
    for x in items:
        p_id = uuid_to_id.get(x["uuid"])
        is_fav = p_id in user_fav_ids if p_id else False
        mapped_items.append(
            ExploreSearchItem(
                id=x["id"],
                uuid=x["uuid"],
                name=x["name"],
                slug=x["slug"],
                category=x["category"],
                distance_km=x["distance_km"],
                distance_formatted=x["distance_formatted"],
                rating_formatted=x["rating_formatted"],
                open_status=x["open_status"],
                imageUrl=x["imageUrl"],
                city=x["city"],
                state=x["state"],
                country=x["country"],
                review_count=x["review_count"],
                avg_rating=x["avg_rating"],
                is_favorite=is_fav,
                recommendation_reason=x.get("recommendation_reason")
            )
        )

    total_pages = (total + payload.page_size - 1) // payload.page_size

    response_data = ExploreSearchResponse(
        items=mapped_items,
        total=total,
        page=payload.page,
        page_size=payload.page_size,
        total_pages=total_pages,
        summary=ai_summary.get("summary", "No summary available."),
        suggested_tags=ai_summary.get("suggested_tags", [])
    )

    return ResponseModel[ExploreSearchResponse](
        success=True,
        message="Discovery search completed successfully.",
        data=response_data
    )
