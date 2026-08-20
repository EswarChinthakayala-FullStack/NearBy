import re
import hashlib
import logging
import httpx
from typing import Dict, Any
from app.core.cache import cache_manager

logger = logging.getLogger(__name__)

def extract_clean_city_name(raw_text: str) -> str:
    cleaned = raw_text.strip()
    patterns = [
        r'^(?:temple tour|sightseeing|family trip|\d+-day trip|weekend getaway|trip|tour|visit|places|attractions|best places)\s+(?:in|to|near|around|at)\s+',
        r'^(?:in|to|near|around|at)\s+'
    ]
    for p in patterns:
        cleaned = re.sub(p, '', cleaned, flags=re.IGNORECASE).strip()
    return cleaned if cleaned else raw_text.strip()

class DestinationResolverService:
    """Resolves arbitrary destination names into GPS coordinates & geographical hierarchy."""

    async def resolve_destination(self, destination: str) -> Dict[str, Any]:
        raw_clean = destination.strip()
        dest_clean = extract_clean_city_name(raw_clean)
        dest_hash = hashlib.md5(dest_clean.lower().encode("utf-8")).hexdigest()[:12]
        cache_key = f"dest_geo:{dest_hash}"

        # 1. Redis Cache lookup
        cached = await cache_manager.get(cache_key)
        if cached:
            return cached

        # 2. Call Nominatim geocoding API
        try:
            url = "https://nominatim.openstreetmap.org/search"
            headers = {"User-Agent": "NearbyTouristGuideApp/2.0 (backend@nearbyapp.com)"}
            params = {
                "q": dest_clean,
                "format": "jsonv2",
                "addressdetails": 1,
                "limit": 1
            }

            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get(url, params=params, headers=headers)
                if response.status_code == 200:
                    results = response.json()
                    if results:
                        first = results[0]
                        addr = first.get("address", {})
                        lat = float(first.get("lat", 17.3850))
                        lng = float(first.get("lon", 78.4866))
                        city_name = addr.get("city") or addr.get("town") or addr.get("state_district") or dest_clean.capitalize()

                        parsed = {
                            "destination_name": city_name,
                            "city": city_name,
                            "district": addr.get("state_district") or addr.get("county") or city_name,
                            "state": addr.get("state", "India"),
                            "country": addr.get("country", "India"),
                            "latitude": lat,
                            "longitude": lng,
                            "formatted_address": first.get("display_name", dest_clean)
                        }
                        await cache_manager.set(cache_key, parsed, ttl=86400)
                        return parsed
        except Exception as e:
            logger.warning(f"Destination geocoding failed for '{dest_clean}': {e}")

        # Fallback values for common Indian travel destinations
        known_defaults = {
            "mysore": (12.2958, 76.6394, "Karnataka"),
            "hampi": (15.3350, 76.4600, "Karnataka"),
            "hyderabad": (17.3850, 78.4866, "Telangana"),
            "coorg": (12.3375, 75.8069, "Karnataka"),
            "ooty": (11.4102, 76.6950, "Tamil Nadu"),
            "araku": (18.3273, 82.8775, "Andhra Pradesh"),
            "goa": (15.2993, 74.1240, "Goa"),
            "pondicherry": (11.9416, 79.8083, "Puducherry"),
            "munnar": (10.0889, 77.0595, "Kerala")
        }

        d_lower = dest_clean.lower()
        if d_lower in known_defaults:
            lat, lng, state = known_defaults[d_lower]
            fallback = {
                "destination_name": dest_clean.capitalize(),
                "city": dest_clean.capitalize(),
                "district": dest_clean.capitalize(),
                "state": state,
                "country": "India",
                "latitude": lat,
                "longitude": lng,
                "formatted_address": f"{dest_clean.capitalize()}, {state}, India"
            }
            await cache_manager.set(cache_key, fallback, ttl=86400)
            return fallback

        default_dest = {
            "destination_name": dest_clean.capitalize(),
            "city": dest_clean.capitalize(),
            "district": dest_clean.capitalize(),
            "state": "Telangana",
            "country": "India",
            "latitude": 17.3850,
            "longitude": 78.4866,
            "formatted_address": f"{dest_clean.capitalize()}, India"
        }
        await cache_manager.set(cache_key, default_dest, ttl=3600)
        return default_dest

destination_resolver_service = DestinationResolverService()
