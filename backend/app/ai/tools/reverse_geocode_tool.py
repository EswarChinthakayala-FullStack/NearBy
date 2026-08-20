import logging
from typing import Dict, Any
from app.services.location.location_context_builder import location_context_builder

logger = logging.getLogger(__name__)

async def reverse_geocode_tool(latitude: float, longitude: float) -> Dict[str, Any]:
    """LangChain / CrewAI tool for fetching location hierarchy & context from backend geocoder."""
    try:
        context = await location_context_builder.build_context(latitude, longitude, search_radius_km=50.0)
        return context
    except Exception as e:
        logger.error(f"Error in reverse_geocode_tool: {e}")
        return {
            "administrative_hierarchy": {"city": "Local Area", "state": "Region", "country": "India"},
            "coordinates": {"latitude": latitude, "longitude": longitude}
        }
