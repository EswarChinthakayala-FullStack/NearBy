from typing import Any, Dict, List, Optional
from app.core.config import settings
from app.core.logging_config import logger
from app.services.external.base import BaseExternalClient


class OverpassClient(BaseExternalClient):
    """OpenStreetMap Overpass API client for querying tourism POIs."""

    def __init__(self):
        super().__init__(
            base_url=settings.OVERPASS_API_URL,
            service_name="OpenStreetMap Overpass"
        )
        self.headers = {"User-Agent": "NearbyTouristApp/1.0 (contact@nearbyapp.com)"}

    async def fetch_tourist_places_by_radius(
        self,
        lat: float,
        lng: float,
        radius_meters: int = 5000
    ) -> List[Dict[str, Any]]:
        """Fetch tourism POIs around a coordinate (lat, lng) within radius_meters using Overpass API."""
        overpass_query = f"""
        [out:json][timeout:25];
        (
          node["tourism"](around:{radius_meters},{lat},{lng});
          way["tourism"](around:{radius_meters},{lat},{lng});
          node["historic"](around:{radius_meters},{lat},{lng});
          way["historic"](around:{radius_meters},{lat},{lng});
          node["amenity"~"place_of_worship|museum"](around:{radius_meters},{lat},{lng});
          node["leisure"~"park|beach|garden"](around:{radius_meters},{lat},{lng});
        );
        out center 100;
        """
        endpoints = [
            "https://z.overpass-api.de/api/interpreter",
            "https://overpass.nchc.org.tw/api/interpreter",
            "https://lz4.overpass-api.de/api/interpreter",
            settings.OVERPASS_API_URL
        ]

        elements = []
        for ep in endpoints:
            try:
                self.base_url = ep
                response = await self.post(data={"data": overpass_query}, headers=self.headers, timeout=20.0)
                elements = response.get("elements", [])
                if elements:
                    break
            except Exception as err:
                logger.warning(f"Overpass radius fetch failed on {ep}: {err}")
                continue

        return self._normalize_osm_elements(elements)

    async def fetch_tourist_places_by_bbox(
        self,
        south: float,
        west: float,
        north: float,
        east: float
    ) -> List[Dict[str, Any]]:
        """Fetch tourism nodes/ways within a bounding box (south, west, north, east)."""
        overpass_query = f"""
        [out:json][timeout:25];
        (
          node["tourism"]({south},{west},{north},{east});
          way["tourism"]({south},{west},{north},{east});
          node["historic"]({south},{west},{north},{east});
          way["historic"]({south},{west},{north},{east});
          node["amenity"~"place_of_worship|museum"]({south},{west},{north},{east});
          node["leisure"~"park|beach|garden"]({south},{west},{north},{east});
        );
        out body center 150;
        """
        
        endpoints = [
            "https://z.overpass-api.de/api/interpreter",
            "https://overpass.nchc.org.tw/api/interpreter",
            "https://lz4.overpass-api.de/api/interpreter",
            settings.OVERPASS_API_URL
        ]

        elements = []
        for ep in endpoints:
            try:
                self.base_url = ep
                response = await self.post(data={"data": overpass_query}, headers=self.headers, timeout=20.0)
                elements = response.get("elements", [])
                if elements:
                    break
            except Exception:
                continue

        return self._normalize_osm_elements(elements)

    async def fetch_tourist_places_by_city(self, city_name: str) -> List[Dict[str, Any]]:
        """Fetch tourism nodes/ways within a city using Nominatim BBOX geocoding & area search fallback."""
        try:
            import httpx
            nom_url = f"https://nominatim.openstreetmap.org/search?city={city_name}&format=json&limit=1"
            async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
                nom_res = await client.get(nom_url)
                if nom_res.status_code == 200 and nom_res.json():
                    bbox = nom_res.json()[0].get("boundingbox")
                    if bbox and len(bbox) == 4:
                        s, n, w, e = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])
                        places = await self.fetch_tourist_places_by_bbox(south=s, west=w, north=n, east=e)
                        if places:
                            return places
        except Exception as nom_err:
            logger.warning(f"Nominatim bbox strategy failed for {city_name}: {nom_err}")

        endpoints = [
            "https://z.overpass-api.de/api/interpreter",
            "https://overpass.nchc.org.tw/api/interpreter",
            "https://lz4.overpass-api.de/api/interpreter",
            settings.OVERPASS_API_URL
        ]

        area_query = f"""
        [out:json][timeout:25];
        (
          area["name"="{city_name}"];
          area["name:en"="{city_name}"];
          area["name"~"{city_name}",i];
        )->.searchArea;
        (
          node["tourism"](area.searchArea);
          way["tourism"](area.searchArea);
          node["historic"](area.searchArea);
          way["historic"](area.searchArea);
          node["amenity"~"place_of_worship|museum"](area.searchArea);
        );
        out body center 150;
        """

        elements = []
        for endpoint in endpoints:
            try:
                self.base_url = endpoint
                response = await self.post(data={"data": area_query}, headers=self.headers, timeout=20.0)
                elements = response.get("elements", [])
                if elements:
                    break
            except Exception:
                continue

        return self._normalize_osm_elements(elements)

    def _normalize_osm_elements(self, elements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalize raw Overpass JSON elements into standardized dicts."""
        normalized = []
        for elem in elements:
            tags = elem.get("tags", {})
            name = tags.get("name")
            if not name:
                continue

            lat = elem.get("lat") or (elem.get("center", {}).get("lat"))
            lon = elem.get("lon") or (elem.get("center", {}).get("lon"))
            if lat is None or lon is None:
                continue

            normalized.append({
                "osm_id": elem.get("id"),
                "osm_type": elem.get("type"),
                "name": name,
                "latitude": float(lat),
                "longitude": float(lon),
                "category_tag": tags.get("tourism") or tags.get("historic") or "tourist_attraction",
                "address": tags.get("addr:full") or tags.get("addr:street"),
                "city": tags.get("addr:city"),
                "state": tags.get("addr:state"),
                "country": tags.get("addr:country"),
                "website": tags.get("website"),
                "phone": tags.get("phone"),
                "opening_hours": tags.get("opening_hours")
            })
        return normalized
