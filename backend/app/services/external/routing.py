from typing import Any, Dict, Optional
from app.core.config import settings
from app.services.external.base import BaseExternalClient


class RoutingClient(BaseExternalClient):
    """OSRM / GraphHopper routing engine client."""

    def __init__(self, base_url: str = settings.OSRM_ROUTING_URL):
        super().__init__(
            base_url=base_url,
            service_name="OSRM Routing Engine"
        )

    async def get_route(
        self,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        profile: str = "driving"
    ) -> Dict[str, Any]:
        """Calculate route distance (meters), duration (seconds), and GeoJSON geometry between two points."""
        # OSRM coordinate format: {longitude},{latitude};{longitude},{latitude}
        coordinates = f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
        endpoint = f"route/v1/{profile}/{coordinates}"

        params = {
            "overview": "full",
            "geometries": "geojson",
            "steps": "true"
        }

        data = await self.get(endpoint=endpoint, params=params)
        routes = data.get("routes", [])

        if not routes:
            return {
                "found": False,
                "distance_meters": 0,
                "duration_seconds": 0,
                "geometry_geojson": None
            }

        primary_route = routes[0]
        return {
            "found": True,
            "provider": "osrm",
            "distance_meters": round(primary_route.get("distance", 0)),
            "duration_seconds": round(primary_route.get("duration", 0)),
            "geometry_geojson": primary_route.get("geometry")
        }
