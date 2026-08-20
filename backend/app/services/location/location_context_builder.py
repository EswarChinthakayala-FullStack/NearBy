import logging
from typing import Dict, Any
from app.services.location.reverse_geocoder import reverse_geocoder

logger = logging.getLogger(__name__)

class LocationContextBuilder:
    """Builds a rich, normalized location context object from live GPS coordinates."""

    async def build_context(
        self,
        latitude: float,
        longitude: float,
        preferred_language: str = "en",
        search_radius_km: float = 25.0
    ) -> Dict[str, Any]:

        # Reverse geocode asynchronously
        geo_data = await reverse_geocoder.reverse_geocode(latitude, longitude)

        city = geo_data.get("city") or "Hyderabad"
        district = geo_data.get("district") or city
        state = geo_data.get("state") or "Telangana"
        country = geo_data.get("country") or "India"

        return {
            "coordinates": {
                "latitude": latitude,
                "longitude": longitude
            },
            "administrative_hierarchy": {
                "country": country,
                "state": state,
                "district": district,
                "city": city,
                "locality": geo_data.get("locality", ""),
                "formatted_address": geo_data.get("formatted_address", "")
            },
            "nearby_cities": [city, district],
            "tourism_region": f"{state}, {country}",
            "search_radius_km": search_radius_km,
            "language": preferred_language,
            "timezone": "Asia/Kolkata"
        }

location_context_builder = LocationContextBuilder()
