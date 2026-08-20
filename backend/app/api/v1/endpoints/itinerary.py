import logging
import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.common import ResponseModel, PaginatedResponse, PaginationMeta
from app.schemas.itinerary import (
    ItineraryGenerateRequest,
    ItineraryResponse,
    ItineraryListItem,
    ItineraryUpdateRequest
)
from app.services.itinerary.query_parser import query_parser_service
from app.services.itinerary.itinerary_context_builder import itinerary_context_builder
from app.services.ai.mistral_itinerary_service import mistral_itinerary_service
from app.services.itinerary.itinerary_storage import itinerary_storage_service
from app.core.telemetry import telemetry_logger
from app.core.metrics import metrics_tracker

router = APIRouter()
logger = logging.getLogger(__name__)


from app.ai.orchestrator.itinerary_orchestrator import itinerary_orchestrator

@router.post(
    "/generate",
    response_model=ResponseModel[ItineraryResponse],
    summary="AI Smart Itinerary Planner — Generate & Save Travel Itinerary",
    description="Conversational AI itinerary engine orchestrating multi-agent crews for custom travel plans."
)
async def generate_itinerary(
    payload: ItineraryGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    request_id = str(uuid.uuid4())
    start_time = time.time()

    # Execute Enterprise Itinerary AI Crew
    raw_itinerary = await itinerary_orchestrator.execute_itinerary_crew(
        db=db,
        user_uuid=str(current_user.uuid),
        query=payload.query,
        destination=payload.destination,
        days=payload.days
    )

    # Save generated itinerary into database
    saved_db_obj = await itinerary_storage_service.save_itinerary(
        db=db,
        user_id=current_user.id,
        raw_itinerary=raw_itinerary
    )

    total_latency = (time.time() - start_time) * 1000
    metrics_tracker.record_search(cache_hit=False, duration_ms=total_latency)

    response_schema = itinerary_storage_service.to_response_schema(saved_db_obj)
    return ResponseModel[ItineraryResponse](
        success=True,
        message="AI travel itinerary generated and saved successfully via Agentic Crew.",
        data=response_schema
    )


@router.get(
    "",
    response_model=PaginatedResponse[ItineraryListItem],
    summary="Get User Itineraries",
    description="Retrieve paginated list of user's saved, planned, and generated itineraries."
)
async def get_user_itineraries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items, total = await itinerary_storage_service.get_user_itineraries(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size
    )

    list_items = []
    for db_obj in items:
        days = db_obj.itinerary_data if isinstance(db_obj.itinerary_data, list) else []
        list_items.append(
            ItineraryListItem(
                id=db_obj.uuid,
                destination=db_obj.destination,
                title=db_obj.title,
                travel_dates=db_obj.travel_dates,
                budget=db_obj.budget,
                day_count=len(days),
                created_at=db_obj.created_at.isoformat() if db_obj.created_at else None
            )
        )

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    return PaginatedResponse[ItineraryListItem](
        success=True,
        message="User itineraries retrieved successfully.",
        data=list_items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.get(
    "/{itinerary_id}",
    response_model=ResponseModel[ItineraryResponse],
    summary="Get Itinerary Details",
    description="Retrieve full details for a specific itinerary by UUID or ID."
)
async def get_itinerary_details(
    itinerary_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_obj = await itinerary_storage_service.get_by_identifier(db, itinerary_id, current_user.id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found.")

    response_schema = itinerary_storage_service.to_response_schema(db_obj)
    return ResponseModel[ItineraryResponse](
        success=True,
        message="Itinerary details retrieved successfully.",
        data=response_schema
    )


@router.delete(
    "/{itinerary_id}",
    response_model=ResponseModel[dict],
    summary="Delete Itinerary",
    description="Remove an existing itinerary from user's saved collection."
)
async def delete_itinerary(
    itinerary_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await itinerary_storage_service.delete_itinerary(db, itinerary_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found.")

    return ResponseModel[dict](
        success=True,
        message="Itinerary deleted successfully.",
        data={"deleted_id": itinerary_id}
    )


@router.patch(
    "/{itinerary_id}",
    response_model=ResponseModel[ItineraryResponse],
    summary="Rename / Edit Itinerary",
    description="Update title, travel dates, or budget tier for an itinerary."
)
async def update_itinerary(
    itinerary_id: str,
    payload: ItineraryUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_obj = await itinerary_storage_service.update_itinerary(
        db=db,
        identifier=itinerary_id,
        user_id=current_user.id,
        title=payload.title,
        travel_dates=payload.travel_dates,
        budget=payload.budget
    )
    if not updated_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found.")

    return ResponseModel[ItineraryResponse](
        success=True,
        message="Itinerary updated successfully.",
        data=itinerary_storage_service.to_response_schema(updated_obj)
    )


@router.post(
    "/{itinerary_id}/duplicate",
    response_model=ResponseModel[ItineraryResponse],
    summary="Duplicate Itinerary",
    description="Create a copy of an existing itinerary."
)
async def duplicate_itinerary(
    itinerary_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    duplicate_obj = await itinerary_storage_service.duplicate_itinerary(db, itinerary_id, current_user.id)
    if not duplicate_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found.")

    return ResponseModel[ItineraryResponse](
        success=True,
        message="Itinerary duplicated successfully.",
        data=itinerary_storage_service.to_response_schema(duplicate_obj)
    )


@router.post(
    "/{itinerary_id}/regenerate",
    response_model=ResponseModel[ItineraryResponse],
    summary="Regenerate AI Itinerary",
    description="Re-runs AI search with latest weather, attractions, and prompt context, updating the existing itinerary."
)
async def regenerate_itinerary(
    itinerary_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = await itinerary_storage_service.get_by_identifier(db, itinerary_id, current_user.id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found.")

    # Re-run query parser and context builder
    query = f"Plan a trip to {existing.destination}"
    parsed = query_parser_service.parse_query(query, explicit_dest=existing.destination)
    context = await itinerary_context_builder.build_context(db, parsed)

    raw_itinerary = await mistral_itinerary_service.generate_itinerary(context)
    raw_itinerary["destination"] = existing.destination

    # Update existing DB object with newly generated data
    existing.title = raw_itinerary.get("title", existing.title)
    existing.itinerary_data = raw_itinerary.get("days", [])
    existing.reasoning_data = {
        "summary": raw_itinerary.get("summary", ""),
        "travel_tips": raw_itinerary.get("travel_tips", [])
    }
    existing.route_data = {"weather_summary": raw_itinerary.get("weather_summary", {})}

    db.add(existing)
    await db.commit()
    await db.refresh(existing)

    return ResponseModel[ItineraryResponse](
        success=True,
        message="Itinerary regenerated successfully with live weather and attractions.",
        data=itinerary_storage_service.to_response_schema(existing)
    )
