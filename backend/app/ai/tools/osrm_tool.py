import logging
from typing import Dict, Any, List
from app.services.routing.osrm_service import osrm_service

logger = logging.getLogger(__name__)

async def osrm_route_tool(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> Dict[str, Any]:
    """LangChain / CrewAI tool for computing OSRM travel distance and driving time."""
    try:
        route = await osrm_service.get_route(
            waypoints=[(origin_lat, origin_lng), (dest_lat, dest_lng)],
            mode="driving"
        )
        return {
            "distance_km": route.get("distance_km", 5.0),
            "duration_minutes": route.get("duration_minutes", 15),
            "mode": "driving"
        }
    except Exception as e:
        logger.error(f"Error in osrm_route_tool: {e}")
        return {"distance_km": 5.0, "duration_minutes": 15, "mode": "driving"}
