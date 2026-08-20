from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.common import ResponseModel
from app.services.location_service import location_service
from app.services.ai_context_builder import ai_context_builder

router = APIRouter()


class LocationReverseGeocodeResponse(BaseModel):
    location_name: str
    city: str
    district: str
    state: str
    country: str
    postal_code: str
    display_name: str
    latitude: float
    longitude: float
    provider: str


@router.get(
    "/reverse",
    response_model=ResponseModel[LocationReverseGeocodeResponse],
    summary="Reverse geocode GPS coordinates to human-readable address",
    description="Resolves latitude and longitude into village, city, district, state, country using Nominatim & Photon."
)
async def reverse_geocode(
    latitude: float = Query(..., description="Latitude coordinate (-90 to 90)"),
    longitude: float = Query(..., description="Longitude coordinate (-180 to 180)")
):
    data = await location_service.reverse_geocode(latitude, longitude)
    res = LocationReverseGeocodeResponse(**data)
    return ResponseModel[LocationReverseGeocodeResponse](
        success=True,
        message=f"Location reverse geocoded to {res.city}, {res.state}.",
        data=res
    )


@router.get(
    "/nearby-pois",
    response_model=ResponseModel[List[Dict[str, Any]]],
    summary="Get spatial POIs from OpenStreetMap",
    description="Queries OpenStreetMap Overpass for tourism and historic POIs around lat/lng."
)
async def get_nearby_pois(
    latitude: float = Query(..., description="Latitude coordinate"),
    longitude: float = Query(..., description="Longitude coordinate"),
    radius_km: float = Query(15.0, description="Search radius in kilometers")
):
    pois = await location_service.fetch_osm_nearby_places(latitude, longitude, radius_km=radius_km)
    return ResponseModel[List[Dict[str, Any]]](
        success=True,
        message=f"Retrieved {len(pois)} OpenStreetMap POIs within {radius_km} km.",
        data=pois
    )
