import asyncio
import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.destination.destination_resolver import destination_resolver_service
from app.services.weather.weather_service import weather_service
from app.services.search.nearby_search_service import nearby_search_service

logger = logging.getLogger(__name__)

class ItineraryContextBuilder:
    """Builds a rich asynchronous context combining Destination, Weather, Attractions, and Hours."""

    async def build_context(
        self,
        db: AsyncSession,
        parsed_query: Dict[str, Any]
    ) -> Dict[str, Any]:
        dest_name = parsed_query.get("destination", "Hyderabad")
        days = parsed_query.get("days", 3)
        trip_type = parsed_query.get("trip_type", "Sightseeing")

        # 1. Resolve Destination & Geolocation
        dest_info = await destination_resolver_service.resolve_destination(dest_name)
        lat = dest_info["latitude"]
        lng = dest_info["longitude"]

        # 2. Concurrently fetch Weather and Nearby Attractions using asyncio.gather()
        weather_task = weather_service.get_weather_forecast(lat, lng)
        attractions_task = nearby_search_service.search_nearby(
            db=db,
            latitude=lat,
            longitude=lng,
            query=f"{dest_name} {trip_type} attractions",
            radius_km=60.0,
            limit=30
        )

        weather_info, candidate_places = await asyncio.gather(
            weather_task,
            attractions_task,
            return_exceptions=True
        )

        if isinstance(weather_info, Exception):
            logger.warning(f"Weather task exception: {weather_info}")
            weather_info = {
                "temperature_c": 26.0,
                "condition": "Pleasant Weather",
                "humidity_pct": 55,
                "rain_probability_pct": 10,
                "recommendation": "Great weather for outdoor exploration."
            }

        if isinstance(candidate_places, Exception) or not candidate_places:
            logger.warning(f"Attractions task exception: {candidate_places}")
            candidate_places = []

        return {
            "parsed_query": parsed_query,
            "destination_info": dest_info,
            "weather_info": weather_info,
            "candidate_places": candidate_places,
            "days_requested": days,
            "trip_type": trip_type
        }

itinerary_context_builder = ItineraryContextBuilder()
