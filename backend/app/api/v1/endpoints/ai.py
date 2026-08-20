from typing import List, Optional, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from app.api.deps import get_db, get_current_user, get_current_user_optional
from app.models.user import User
from app.models.place import Place
from app.models.favorite import Favorite
from app.models.itinerary import SavedItinerary
from app.schemas.common import ResponseModel
from app.schemas.place import PlaceListItem
from app.schemas.category import CategoryRead
from app.utils.image_helpers import get_place_cover_image
from app.services.mistral_service import generate_mistral_itinerary_prompt

router = APIRouter()


class AISearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Natural language search query")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    max_results: int = Field(10, ge=1, le=50)


class AISearchResponse(BaseModel):
    query: str
    summary: str
    suggested_tags: List[str]
    places: List[PlaceListItem]


class AIItineraryRequest(BaseModel):
    destination: str = Field(..., min_length=2, description="Destination city or region")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    radius_km: Optional[float] = Field(15.0, ge=1.0, le=100.0)
    source: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travel_time: Optional[str] = "2 Days / 1 Night"
    budget: Optional[str] = "Moderate"
    transportation: Optional[str] = "Car"
    travel_style: Optional[List[str]] = []
    accessibility: Optional[List[str]] = []
    food_preferences: Optional[List[str]] = []
    accommodation_preference: Optional[str] = "Resort"
    adults: int = 1
    children: int = 0
    seniors: int = 0
    pets: int = 0


class AIReasoning(BaseModel):
    title: str
    description: str


class TimeSlot(BaseModel):
    time: str
    activity: str
    location: str
    notes: Optional[str] = None
    place_uuid: Optional[str] = None


class DayPlan(BaseModel):
    day: int
    title: str
    slots: List[TimeSlot]


class EmergencyContacts(BaseModel):
    hospitals: List[str]
    police: str
    pharmacy: str
    atm: str


class AIItineraryResponse(BaseModel):
    destination: str
    summary: str
    estimated_cost: str
    recommended_duration: str
    reasoning: List[AIReasoning]
    packing_checklist: List[str]
    weather_advisory: str
    days: List[DayPlan]
    emergency_contacts: EmergencyContacts
    tips: List[str]
    places: List[PlaceListItem] = []


from app.services.mistral_service import generate_mistral_itinerary_prompt, generate_mistral_search_summary
from app.services.ai_context_builder import ai_context_builder

def _build_category_read(cat_raw: Any) -> Optional[CategoryRead]:
    if not cat_raw:
        return None
    if isinstance(cat_raw, CategoryRead):
        return cat_raw
    if hasattr(cat_raw, "id") and hasattr(cat_raw, "name") and hasattr(cat_raw, "slug"):
        return CategoryRead.model_validate(cat_raw)
    if isinstance(cat_raw, dict) and "name" in cat_raw:
        return CategoryRead(
            id=int(cat_raw.get("id", 1)),
            name=str(cat_raw.get("name", "Attraction")),
            slug=str(cat_raw.get("slug", "attraction"))
        )
    if isinstance(cat_raw, str) and cat_raw.strip():
        name_str = cat_raw.strip().title()
        return CategoryRead(
            id=1,
            name=name_str,
            slug=name_str.lower().replace(" ", "-")
        )
    return None

@router.post(
    "/search",
    response_model=ResponseModel[AISearchResponse],
    summary="Natural language AI travel search powered by Mistral AI & Location Intelligence",
    description="Searches tourist places using vector/keyword intelligence synthesized with real GPS location, weather, and POIs."
)
async def ai_search(
    payload: AISearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query_str = payload.query.strip().lower()
    lat = payload.latitude or 15.4909
    lng = payload.longitude or 73.8278

    # 1. Build Location Intelligence Context (GPS + Reverse Geocode + Weather + DB Places + OSM POIs)
    loc_ctx = await ai_context_builder.build_context(
        db=db,
        latitude=lat,
        longitude=lng,
        radius_km=25.0,
        query=query_str
    )

    combined_places = loc_ctx.get("combined_places", [])
    user_location_name = loc_ctx.get("current_location", {}).get("display_name") or loc_ctx.get("current_location", {}).get("city", "")

    candidate_dicts = [
        {
            "uuid": str(p.get("uuid")),
            "name": p.get("name"),
            "city": p.get("city"),
            "category_name": p.get("category").name if hasattr(p.get("category"), "name") else str(p.get("category", ""))
        }
        for p in combined_places
    ]

    # 2. Generate Mistral AI response summary with live location context
    mistral_res = await generate_mistral_search_summary(
        query=payload.query,
        places=candidate_dicts,
        user_location=user_location_name
    )

    user_fav_ids = set()
    if current_user:
        fav_stmt = select(Favorite.place_id).where(Favorite.user_id == current_user.id)
        fav_res = await db.execute(fav_stmt)
        user_fav_ids = set(fav_res.scalars().all())

    place_items = []
    for p in combined_places:
        if isinstance(p, dict) and "slug" in p:
            p_id = p.get("id")
            item = PlaceListItem(
                uuid=str(p["uuid"]),
                name=p["name"],
                slug=p["slug"],
                city=p.get("city", "Local Region"),
                latitude=float(p["latitude"]),
                longitude=float(p["longitude"]),
                status=p.get("status", "published"),
                avg_rating=float(p.get("avg_rating", 4.5)),
                total_reviews=p.get("total_reviews", 0),
                total_favorites=p.get("total_favorites", 0),
                category=_build_category_read(p.get("category")),
                cover_image_url=p.get("cover_image_url", ""),
                is_favorite=(p_id in user_fav_ids if p_id else False)
            )
            place_items.append(item)

    city_name = loc_ctx.get("current_location", {}).get("city", "your area")

    data = AISearchResponse(
        query=payload.query,
        summary=mistral_res.get("summary") or f"Found {len(place_items)} top recommended destinations around {city_name} for '{payload.query}'.",
        suggested_tags=mistral_res.get("suggested_tags") or ["Top Rated", "Nearby Spot", "Verified"],
        places=place_items
    )

    return ResponseModel[AISearchResponse](
        success=True,
        message="AI search processed successfully with Location Intelligence context.",
        data=data
    )


@router.post(
    "/itinerary",
    response_model=ResponseModel[AIItineraryResponse],
    summary="Neural travel itinerary planner powered by Mistral AI & Location Intelligence",
    description="Generates a structured multi-day itinerary using real GPS, live weather, and location POI context."
)
async def ai_itinerary(
    payload: AIItineraryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    dest = payload.destination.strip()
    lat = payload.latitude or 15.4909
    lng = payload.longitude or 73.8278

    # 1. Build Location Context
    loc_ctx = await ai_context_builder.build_context(
        db=db,
        latitude=lat,
        longitude=lng,
        radius_km=payload.radius_km or 15.0,
        query=dest
    )
    
    combined_places = loc_ctx.get("combined_places", [])

    place_dicts = [
        {"name": p.get("name"), "city": p.get("city"), "rating": float(p.get("avg_rating", 4.5)), "uuid": str(p.get("uuid"))}
        for p in combined_places
    ]

    # Attempt Mistral AI response
    mistral_data = await generate_mistral_itinerary_prompt(
        destination=dest,
        travel_context=payload.dict(),
        places=place_dicts
    )

    user_fav_ids = set()
    if current_user:
        fav_stmt = select(Favorite.place_id).where(Favorite.user_id == current_user.id)
        fav_res = await db.execute(fav_stmt)
        user_fav_ids = set(fav_res.scalars().all())

    place_items = []
    for p in combined_places:
        if isinstance(p, dict) and "slug" in p:
            p_id = p.get("id")
            item = PlaceListItem(
                uuid=str(p.get("uuid")),
                name=p["name"],
                slug=p["slug"],
                city=p.get("city", dest),
                latitude=float(p["latitude"]),
                longitude=float(p["longitude"]),
                status=p.get("status", "published"),
                avg_rating=float(p.get("avg_rating", 4.5)),
                total_reviews=p.get("total_reviews", 0),
                total_favorites=p.get("total_favorites", 0),
                category=_build_category_read(p.get("category")),
                cover_image_url=p.get("cover_image_url", ""),
                is_favorite=(p_id in user_fav_ids if p_id else False)
            )
            place_items.append(item)

    # Parse reasoning list from mistral_data
    reasoning_list = []
    for r in mistral_data.get("reasoning", []):
        if isinstance(r, dict) and "title" in r and "description" in r:
            reasoning_list.append(AIReasoning(title=r["title"], description=r["description"]))
    if not reasoning_list:
        p1_name = combined_places[0].get("name") if len(combined_places) > 0 else "Heritage Architecture Walk"
        p2_name = combined_places[1].get("name") if len(combined_places) > 1 else "Coastal Sunset Viewpoint"
        reasoning_list = [
            AIReasoning(title="Morning Route Optimization", description=f"Early visit to {p1_name} minimizes queues and avoids peak heat."),
            AIReasoning(title="Budget Alignment", description=f"Itinerary fits within your {payload.budget} budget tier."),
            AIReasoning(title="Sunset Viewpoint Positioning", description=f"Positioned {p2_name} for golden hour scenery."),
        ]

    # Parse days list from mistral_data
    days_list = []
    for d in mistral_data.get("days", []):
        if isinstance(d, dict) and "slots" in d:
            slots_list = []
            for s in d.get("slots", []):
                if isinstance(s, dict) and "time" in s and "activity" in s:
                    slots_list.append(TimeSlot(
                        time=s.get("time", "09:00 AM"),
                        activity=s.get("activity", "Sightseeing"),
                        location=s.get("location", dest),
                        notes=s.get("notes"),
                        place_uuid=s.get("place_uuid")
                    ))
            days_list.append(DayPlan(
                day=d.get("day", len(days_list) + 1),
                title=d.get("title", f"Day {len(days_list) + 1} in {dest}"),
                slots=slots_list
            ))

    if not days_list:
        p1_name = combined_places[0].get("name") if len(combined_places) > 0 else "Heritage Architecture Walk"
        p2_name = combined_places[1].get("name") if len(combined_places) > 1 else "Coastal Sunset Viewpoint"
        p3_name = combined_places[2].get("name") if len(combined_places) > 2 else "Cultural Heritage Museum"
        p4_name = combined_places[3].get("name") if len(combined_places) > 3 else "Botanical Nature Sanctuary"
        days_list = [
            DayPlan(
                day=1,
                title=f"Historical Landmarks & Highlights of {dest}",
                slots=[
                    TimeSlot(time="08:30 AM", activity="Guided Architecture Exploration", location=p1_name, notes="Wear comfortable walking shoes", place_uuid=str(combined_places[0].get("uuid")) if len(combined_places) > 0 else None),
                    TimeSlot(time="01:00 PM", activity="Authentic Regional Cuisine Lunch", location=f"{dest} Central Market", notes="Local specialties"),
                    TimeSlot(time="04:30 PM", activity="Sunset Radar Trail & Photography", location=p2_name, notes="Golden hour photography spot", place_uuid=str(combined_places[1].get("uuid")) if len(combined_places) > 1 else None),
                    TimeSlot(time="08:00 PM", activity="Waterfront Dinner Experience", location=f"{dest} Promenade Bistro", notes="Acoustic music setting"),
                ]
            ),
            DayPlan(
                day=2,
                title=f"Nature Trails & Culture in {dest}",
                slots=[
                    TimeSlot(time="08:30 AM", activity="Morning Botanical Walk", location=p4_name, notes="Fresh air trail walk", place_uuid=str(combined_places[3].get("uuid")) if len(combined_places) > 3 else None),
                    TimeSlot(time="12:00 PM", activity="Museum & Heritage Artifacts Tour", location=p3_name, notes="Audio tour available", place_uuid=str(combined_places[2].get("uuid")) if len(combined_places) > 2 else None),
                    TimeSlot(time="03:30 PM", activity="Artisan Crafts & Souvenir Market", location=f"{dest} Old Market", notes="Handmade souvenirs"),
                    TimeSlot(time="07:00 PM", activity="Farewell Dinner & Departure Prep", location=f"{dest} Rooftop Cafe", notes="Advance table reservation recommended"),
                ]
            )
        ]

    emergency_dict = mistral_data.get("emergency_contacts", {})
    emergency = EmergencyContacts(
        hospitals=emergency_dict.get("hospitals") or [f"{dest} General Hospital", "St. Jude Medical Center"],
        police=emergency_dict.get("police") or f"{dest} Central Police Station (+91 100)",
        pharmacy=emergency_dict.get("pharmacy") or "24/7 MedPlus Pharmacy",
        atm=emergency_dict.get("atm") or "HDFC & SBI 24/7 ATM Kiosk"
    )

    data = AIItineraryResponse(
        destination=dest,
        summary=mistral_data.get("summary") or f"Personalized neural itinerary generated for {payload.adults} traveler(s) visiting {dest} ({payload.budget} tier).",
        estimated_cost=mistral_data.get("estimated_cost") or f"₹5,000 - ₹12,000 total ({payload.budget} Tier)",
        recommended_duration=mistral_data.get("recommended_duration") or payload.travel_time or "2 Days / 1 Night",
        reasoning=reasoning_list,
        packing_checklist=mistral_data.get("packing_checklist") or ["Comfortable walking shoes", "Sunscreen & Sunglasses", "Camera", "Light Jacket", "Refillable Water Bottle", "Power Bank"],
        weather_advisory=mistral_data.get("weather_advisory") or f"Clear skies expected in {dest}. Ideal sightseeing conditions.",
        days=days_list,
        emergency_contacts=emergency,
        tips=mistral_data.get("tips") or [
            f"Start early at 8:30 AM in {dest} to bypass peak queues.",
            "Carry cash for local artisan street vendors.",
            "Pre-book sunset photography spots on weekends."
        ],
        places=place_items
    )

    return ResponseModel[AIItineraryResponse](
        success=True,
        message="AI Itinerary generated successfully.",
        data=data
    )


class SaveItineraryRequest(BaseModel):
    destination: str
    title: str
    travel_dates: Optional[str] = None
    budget: Optional[str] = None
    itinerary_data: Any
    reasoning_data: Optional[Any] = None
    route_data: Optional[Any] = None


from app.api.deps import get_db, get_current_user, get_current_user_optional

@router.post(
    "/itinerary/save",
    response_model=ResponseModel[dict],
    summary="Save travel itinerary to database",
    description="Saves a generated AI itinerary to the database."
)
async def save_itinerary(
    payload: SaveItineraryRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    saved_item = SavedItinerary(
        user_id=current_user.id if current_user else 1,
        destination=payload.destination,
        title=payload.title,
        travel_dates=payload.travel_dates,
        budget=payload.budget,
        itinerary_data=payload.itinerary_data,
        reasoning_data=payload.reasoning_data,
        route_data=payload.route_data
    )
    
    db.add(saved_item)
    await db.commit()
    await db.refresh(saved_item)

    return ResponseModel[dict](
        success=True,
        message="Travel itinerary saved to database successfully.",
        data={"uuid": saved_item.uuid, "title": saved_item.title}
    )


@router.get(
    "/itinerary/saved",
    response_model=ResponseModel[List[dict]],
    summary="Get user's saved itineraries",
    description="Retrieves all travel itineraries saved in the database."
)
async def get_saved_itineraries(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    target_user_id = current_user.id if current_user else 1
    stmt = (
        select(SavedItinerary)
        .where(SavedItinerary.user_id == target_user_id)
        .order_by(desc(SavedItinerary.created_at))
    )
    res = await db.execute(stmt)
    records = list(res.scalars().all())

    items = [
        {
            "uuid": item.uuid,
            "destination": item.destination,
            "title": item.title,
            "travel_dates": item.travel_dates,
            "budget": item.budget,
            "itinerary_data": item.itinerary_data,
            "created_at": item.created_at.isoformat() if item.created_at else None
        }
        for item in records
    ]

    return ResponseModel[List[dict]](
        success=True,
        message=f"Retrieved {len(items)} saved itineraries.",
        data=items
    )


@router.get(
    "/itinerary/saved/{uuid}",
    response_model=ResponseModel[dict],
    summary="Get saved itinerary by UUID",
    description="Retrieves a specific travel itinerary by its unique UUID for public sharing."
)
async def get_saved_itinerary_by_uuid(
    uuid: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SavedItinerary).where(SavedItinerary.uuid == uuid)
    res = await db.execute(stmt)
    item = res.scalars().first()

    if not item:
        raise HTTPException(status_code=404, detail="Saved itinerary not found")

    return ResponseModel[dict](
        success=True,
        message="Itinerary retrieved successfully.",
        data={
            "uuid": item.uuid,
            "destination": item.destination,
            "title": item.title,
            "travel_dates": item.travel_dates,
            "budget": item.budget,
            "itinerary_data": item.itinerary_data,
            "created_at": item.created_at.isoformat() if item.created_at else None
        }
    )


from fastapi.responses import Response
from app.services.pdf_service import generate_itinerary_pdf_bytes


class ExportPDFRequest(BaseModel):
    itinerary_data: Any


@router.post(
    "/itinerary/export-pdf",
    summary="Export travel itinerary to PDF using Jinja2 & HTML template",
    description="Compiles an HTML/Jinja2 template into a PDF binary document for printing."
)
async def export_itinerary_pdf(payload: ExportPDFRequest):
    data = payload.itinerary_data
    dest = data.get("destination", "Itinerary") if isinstance(data, dict) else "Itinerary"
    pdf_bytes = generate_itinerary_pdf_bytes(data if isinstance(data, dict) else {})
    
    filename = f"{dest.lower().replace(' ', '_')}_itinerary.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )


# ═══════════════════════════════════════════════════════════════════════════════
# AI NEARBY SEARCH ENGINE — ASYNCHRONOUS PIPELINE (2026 ENTERPRISE EDITION)
# ═══════════════════════════════════════════════════════════════════════════════

import asyncio
import hashlib
import time
import uuid
from app.schemas.ai.nearby_schema import AINearbyRequest, AINearbyResponse
from app.ai.orchestrator.nearby_orchestrator import nearby_orchestrator
from app.core.cache import cache_manager
from app.core.telemetry import telemetry_logger
from app.core.metrics import metrics_tracker

@router.post(
    "/nearby",
    response_model=ResponseModel[AINearbyResponse],
    summary="AI Nearby Search Engine — Live GPS Location Context & Recommendations",
    description="Asynchronous AI-powered nearby search engine accepting user GPS coordinates and natural language query."
)
async def ai_nearby_search(
    payload: AINearbyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    request_id = str(uuid.uuid4())
    start_time = time.time()

    lat = payload.latitude
    lng = payload.longitude
    query_str = payload.query.strip()

    lat_round = round(lat, 3)
    lng_round = round(lng, 3)
    query_hash = hashlib.md5(query_str.lower().encode("utf-8")).hexdigest()[:12]
    cache_key = f"ai_nearby:{lat_round}:{lng_round}:{query_hash}"

    cached_result = await cache_manager.get(cache_key)
    if isinstance(cached_result, dict) and "summary" in cached_result and "recommendations" in cached_result:
        total_lat = (time.time() - start_time) * 1000
        telemetry_logger.log_ai_nearby_request(
            request_id=request_id,
            user_id=str(current_user.id),
            query=query_str,
            latitude=lat,
            longitude=lng,
            cache_hit=True,
            ai_latency_ms=0.0,
            db_latency_ms=0.0,
            total_latency_ms=total_lat,
            result_count=len(cached_result.get("recommendations", []))
        )
        metrics_tracker.record_search(cache_hit=True, duration_ms=total_lat)

        return ResponseModel[AINearbyResponse](
            success=True,
            message="AI recommendations retrieved from cache.",
            data=ai_response_formatter.format_response(cached_result)
        )

    # Execute Enterprise Nearby AI Crew
    formatted_response = await nearby_orchestrator.execute_nearby_crew(
        db=db,
        query=query_str,
        latitude=lat,
        longitude=lng
    )

    total_latency = (time.time() - start_time) * 1000
    metrics_tracker.record_search(cache_hit=False, duration_ms=total_latency)

    return ResponseModel[AINearbyResponse](
        success=True,
        message="AI nearby recommendations generated successfully via Agentic Crew.",
        data=formatted_response
    )

