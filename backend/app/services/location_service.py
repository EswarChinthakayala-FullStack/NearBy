import httpx
from typing import Dict, Any, List, Optional
from app.core.logging_config import logger
from app.services.geo_service import geo_service
from app.services.external.osm import OverpassClient

NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
PHOTON_REVERSE_URL = "https://photon.komoot.io/reverse"
DEFAULT_USER_AGENT = "NearbyTourismApp/1.0 (contact@nearby.app)"


class LocationService:
    """Production location intelligence service handling reverse geocoding and OSM POI discovery."""

    def __init__(self):
        self.overpass_client = OverpassClient()

    async def reverse_geocode(
        self,
        latitude: float,
        longitude: float
    ) -> Dict[str, Any]:
        """
        Performs reverse geocoding of lat/lng coordinates using OpenStreetMap Nominatim
        with automatic fallback to Photon by Komoot.
        """
        geo_service.validate(latitude, longitude)

        # 1. Primary: OpenStreetMap Nominatim
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                headers = {"User-Agent": DEFAULT_USER_AGENT}
                params = {
                    "format": "jsonv2",
                    "lat": latitude,
                    "lon": longitude,
                    "zoom": 18,
                    "addressdetails": 1
                }
                resp = await client.get(NOMINATIM_REVERSE_URL, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    addr = data.get("address", {})

                    location_name = (
                        addr.get("village") or
                        addr.get("suburb") or
                        addr.get("neighbourhood") or
                        addr.get("road") or
                        addr.get("town") or
                        addr.get("city") or
                        data.get("name") or
                        "Current Location"
                    )
                    city = (
                        addr.get("city") or
                        addr.get("town") or
                        addr.get("municipality") or
                        addr.get("county") or
                        location_name
                    )
                    district = addr.get("county") or addr.get("state_district") or city
                    state = addr.get("state") or ""
                    country = addr.get("country") or "India"
                    postal_code = addr.get("postcode") or ""

                    return {
                        "location_name": location_name,
                        "city": city,
                        "district": district,
                        "state": state,
                        "country": country,
                        "postal_code": postal_code,
                        "display_name": data.get("display_name") or f"{location_name}, {city}, {state}",
                        "latitude": latitude,
                        "longitude": longitude,
                        "provider": "nominatim"
                    }
        except Exception as e:
            logger.warning(f"Nominatim reverse geocoding failed, falling back to Photon: {str(e)}")

        # 2. Fallback: Photon by Komoot
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                headers = {"User-Agent": DEFAULT_USER_AGENT}
                params = {"lat": latitude, "lon": longitude}
                resp = await client.get(PHOTON_REVERSE_URL, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    features = data.get("features", [])
                    if features:
                        props = features[0].get("properties", {})
                        location_name = props.get("name") or props.get("street") or "Current Location"
                        city = props.get("city") or props.get("town") or location_name
                        district = props.get("district") or props.get("county") or city
                        state = props.get("state") or ""
                        country = props.get("country") or "India"
                        postal_code = props.get("postcode") or ""

                        return {
                            "location_name": location_name,
                            "city": city,
                            "district": district,
                            "state": state,
                            "country": country,
                            "postal_code": postal_code,
                            "display_name": f"{location_name}, {city}, {state}, {country}".strip(", "),
                            "latitude": latitude,
                            "longitude": longitude,
                            "provider": "photon"
                        }
        except Exception as e:
            logger.error(f"Photon reverse geocoding failed: {str(e)}")

        # 3. Defensive Coordinate Fallback
        return {
            "location_name": f"Location ({latitude:.4f}, {longitude:.4f})",
            "city": "Local Region",
            "district": "Local District",
            "state": "",
            "country": "India",
            "postal_code": "",
            "display_name": f"{latitude:.4f}, {longitude:.4f}",
            "latitude": latitude,
            "longitude": longitude,
            "provider": "coordinates"
        }

    async def fetch_osm_nearby_places(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 15.0
    ) -> List[Dict[str, Any]]:
        """
        Discovers tourism and historic POIs around lat/lng within radius_km using Overpass bounding box.
        """
        min_lat, min_lng, max_lat, max_lng = geo_service.bounding_box(latitude, longitude, radius_km)
        raw_pois = await self.overpass_client.fetch_tourist_places_by_bbox(min_lat, min_lng, max_lat, max_lng)

        results = []
        for poi in raw_pois:
            plat = poi.get("latitude")
            plng = poi.get("longitude")
            if plat is not None and plng is not None:
                dist = geo_service.distance(latitude, longitude, plat, plng)
                if dist <= radius_km:
                    poi["distance_km"] = dist
                    results.append(poi)

        results.sort(key=lambda x: x.get("distance_km", 999))
        return results


location_service = LocationService()
