import logging
import httpx
from typing import Dict, Any, Optional
from app.core.cache import cache_manager

logger = logging.getLogger(__name__)

class ReverseGeocoderService:
    """Asynchronous Reverse Geocoding service with Redis caching and coordinate grid rounding."""

    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/reverse"
        self.headers = {"User-Agent": "NearbyTouristGuideApp/2.0 (backend@nearbyapp.com)"}

    async def reverse_geocode(self, latitude: float, longitude: float) -> Dict[str, Any]:
        lat_round = round(latitude, 3)
        lng_round = round(longitude, 3)
        cache_key = f"reverse_geo:{lat_round}:{lng_round}"

        # 1. Check Redis cache first
        cached = await cache_manager.get(cache_key)
        if cached:
            return cached

        # 2. Perform external HTTP call asynchronously
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get(
                    self.base_url,
                    params={
                        "lat": latitude,
                        "lon": longitude,
                        "format": "jsonv2",
                        "addressdetails": 1
                    },
                    headers=self.headers
                )

                if response.status_code == 200:
                    data = response.json()
                    addr = data.get("address", {})
                    
                    parsed = {
                        "country": addr.get("country", ""),
                        "state": addr.get("state") or addr.get("region", ""),
                        "district": addr.get("state_district") or addr.get("county") or addr.get("district", ""),
                        "city": addr.get("city") or addr.get("town") or addr.get("municipality", ""),
                        "town": addr.get("town", ""),
                        "village": addr.get("village", ""),
                        "postal_code": addr.get("postcode", ""),
                        "locality": addr.get("suburb") or addr.get("neighbourhood") or addr.get("residential", ""),
                        "suburb": addr.get("suburb", ""),
                        "administrative_region": addr.get("state", ""),
                        "formatted_address": data.get("display_name", f"{latitude}, {longitude}")
                    }

                    # Cache for 24 hours (86400 seconds)
                    await cache_manager.set(cache_key, parsed, ttl=86400)
                    return parsed
        except Exception as e:
            logger.error(f"Reverse geocoding failed for ({latitude}, {longitude}): {e}")

        # Fallback response (only used if network/API fails completely)
        fallback = {
            "country": "",
            "state": "",
            "district": "",
            "city": "",
            "town": "",
            "village": "",
            "postal_code": "",
            "locality": "",
            "suburb": "",
            "administrative_region": "",
            "formatted_address": f"{lat_round}, {lng_round}"
        }
        await cache_manager.set(cache_key, fallback, ttl=300)
        return fallback

reverse_geocoder = ReverseGeocoderService()
