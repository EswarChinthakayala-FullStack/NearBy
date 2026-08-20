import math
import logging
import httpx
from typing import Dict, Any
from app.core.cache import cache_manager

logger = logging.getLogger(__name__)

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class OSRMService:
    """Asynchronous OSRM Routing Engine for route distance matrix & travel time estimation."""

    async def get_route_travel_minutes(self, lat1: float, lng1: float, lat2: float, lng2: float) -> int:
        l1_r = round(lat1, 3)
        ln1_r = round(lng1, 3)
        l2_r = round(lat2, 3)
        ln2_r = round(lng2, 3)

        if l1_r == l2_r and ln1_r == ln2_r:
            return 0

        cache_key = f"osrm_route:{l1_r}:{ln1_r}:{l2_r}:{ln2_r}"
        cached = await cache_manager.get(cache_key)
        if cached is not None and isinstance(cached, (int, float)):
            return int(cached)

        try:
            url = f"http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=false"
            async with httpx.AsyncClient(timeout=2.5) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    routes = data.get("routes", [])
                    if routes:
                        duration_sec = routes[0].get("duration", 0.0)
                        minutes = max(1, math.ceil(duration_sec / 60.0))
                        await cache_manager.set(cache_key, minutes, ttl=86400)
                        return minutes
        except Exception as e:
            logger.warning(f"OSRM routing request note: {e}")

        # Fallback travel time based on Haversine distance (average city speed 30 km/h)
        dist_km = haversine_km(lat1, lng1, lat2, lng2)
        fallback_minutes = max(5, math.ceil((dist_km / 30.0) * 60))
        await cache_manager.set(cache_key, fallback_minutes, ttl=3600)
        return fallback_minutes

osrm_service = OSRMService()
