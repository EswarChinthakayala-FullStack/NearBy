from typing import Any, Dict
from fastapi import APIRouter, Query
from app.schemas.common import ResponseModel
from app.services.routing_service import routing_service

router = APIRouter()


@router.get(
    "",
    response_model=ResponseModel[Dict[str, Any]],
    summary="Get directions and route calculation",
    description="Calculate route distance, estimated travel time, and polyline geometry between origin and destination points."
)
async def get_directions(
    origin_lat: float = Query(..., ge=-90.0, le=90.0, description="Origin latitude"),
    origin_lng: float = Query(..., ge=-180.0, le=180.0, description="Origin longitude"),
    dest_lat: float = Query(..., ge=-90.0, le=90.0, description="Destination latitude"),
    dest_lng: float = Query(..., ge=-180.0, le=180.0, description="Destination longitude")
):
    route_data = await routing_service.get_directions(
        origin_lat=origin_lat,
        origin_lng=origin_lng,
        dest_lat=dest_lat,
        dest_lng=dest_lng
    )

    return ResponseModel[Dict[str, Any]](
        success=True,
        message="Route calculation completed successfully.",
        data=route_data
    )
