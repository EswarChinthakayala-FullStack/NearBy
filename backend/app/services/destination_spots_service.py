"""
Free, no-API-key destination spot discovery.

Given a destination name (city, town, region) or lat/lng, resolves it to coordinates
via OpenStreetMap Nominatim and queries the public Overpass API for named
points of interest around it — tourist attractions, historic sites, natural
landmarks, restaurants, and shopping areas. This replaces a static,
hand-maintained per-city dictionary with a source that works for ANY
destination Nominatim can geocode, entirely free and keyless.

Both OpenStreetMap services have public-usage policies that must be
respected:
  - Nominatim: max ~1 request/second, requires an identifying User-Agent.
    https://operations.osmfoundation.org/policies/nominatim/
  - Overpass: shared public infrastructure — queries are scoped by radius
    and tag filters, and results are cached rather than re-fetched per
    request.
"""

import asyncio
import re
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

import httpx

from app.core.logging_config import logger

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",  # fallback mirror
]

NOMINATIM_USER_AGENT = "NearbyTourismApp/1.0 (contact@nearby.app)"

REQUEST_TIMEOUT_SECONDS = 15.0
CACHE_TTL_HOURS = 24
MAX_CACHE_ENTRIES = 300
MIN_NOMINATIM_INTERVAL_SECONDS = 1.0  # Nominatim usage policy: max 1 req/sec

# Tag groups -> bucket + Overpass search radius (meters). Attractions/nature
# are worth searching wider; food/shopping stay close to the city center.
_CATEGORY_SPECS: Dict[str, Dict[str, Any]] = {
    "attractions": {
        "radius_m": 20000,
        "queries": [
            ("tourism", "attraction|museum|viewpoint|gallery|artwork|zoo|theme_park"),
            ("historic", ".*"),
        ],
    },
    "nature": {
        "radius_m": 25000,
        "queries": [
            ("natural", "waterfall|beach|peak|cave_entrance"),
            ("leisure", "park|nature_reserve|garden"),
        ],
    },
    "food": {
        "radius_m": 8000,
        "queries": [
            ("amenity", "restaurant|cafe"),
        ],
    },
    "shopping": {
        "radius_m": 8000,
        "queries": [
            ("shop", "mall|marketplace|department_store"),
            ("amenity", "marketplace"),
        ],
    },
}

_TOURISM_TAG_PRIORITY = {
    "attraction": 3, "museum": 3, "viewpoint": 2, "gallery": 2,
    "artwork": 1, "zoo": 2, "theme_park": 2,
}


@dataclass
class Spot:
    name: str
    category: str  # bucket: attractions / nature / food / shopping
    tag: str       # raw osm tag, e.g. "tourism=museum"
    lat: Optional[float]
    lon: Optional[float]
    wikipedia: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "category": self.category,
            "tag": self.tag,
            "lat": self.lat,
            "lon": self.lon,
            "wikipedia": self.wikipedia,
        }


class DestinationSpotsService:
    """Resolves a destination name to real, named points of interest — free, no API key."""

    def __init__(
        self,
        cache_ttl_hours: int = CACHE_TTL_HOURS,
        request_timeout_seconds: float = REQUEST_TIMEOUT_SECONDS,
    ):
        self._cache: Dict[str, Tuple[datetime, Dict[str, List[Dict[str, Any]]]]] = {}
        self.cache_ttl_hours = cache_ttl_hours
        self.request_timeout_seconds = request_timeout_seconds
        self._last_nominatim_call = 0.0
        self._nominatim_lock = asyncio.Lock()

    # ------------------------------------------------------------
    # Geocoding (Nominatim)
    # ------------------------------------------------------------

    async def _geocode(self, client: httpx.AsyncClient, destination: str) -> Optional[Tuple[float, float]]:
        async with self._nominatim_lock:
            elapsed = time.monotonic() - self._last_nominatim_call
            if elapsed < MIN_NOMINATIM_INTERVAL_SECONDS:
                await asyncio.sleep(MIN_NOMINATIM_INTERVAL_SECONDS - elapsed)
            try:
                response = await client.get(
                    NOMINATIM_URL,
                    params={"q": destination, "format": "json", "limit": 1},
                    headers={"User-Agent": NOMINATIM_USER_AGENT},
                )
            except (httpx.TimeoutException, httpx.TransportError) as exc:
                logger.warning(f"Nominatim geocoding failed for '{destination}': {exc}")
                return None
            finally:
                self._last_nominatim_call = time.monotonic()

        if response.status_code != 200:
            logger.warning(f"Nominatim returned status {response.status_code} for '{destination}'")
            return None

        results = response.json()
        if not results:
            return None

        return float(results[0]["lat"]), float(results[0]["lon"])

    # ------------------------------------------------------------
    # POI search (Overpass)
    # ------------------------------------------------------------

    @staticmethod
    def _build_overpass_query(lat: float, lon: float, categories: List[str]) -> str:
        return f"""[out:json][timeout:10];
(
  node["tourism"](around:15000,{lat},{lon});
  way["tourism"](around:15000,{lat},{lon});
  node["historic"](around:15000,{lat},{lon});
  way["historic"](around:15000,{lat},{lon});
  node["natural"](around:15000,{lat},{lon});
  node["leisure"="park"](around:15000,{lat},{lon});
  node["amenity"="restaurant"](around:8000,{lat},{lon});
);
out center tags 60;"""

    async def _run_overpass_query(self, client: httpx.AsyncClient, query: str) -> Optional[List[dict]]:
        headers = {
            "User-Agent": NOMINATIM_USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded"
        }
        for endpoint in OVERPASS_ENDPOINTS:
            try:
                response = await client.post(endpoint, data={"data": query}, headers=headers, timeout=4.0)
                if response.status_code == 200:
                    return response.json().get("elements", [])
                logger.warning(f"Overpass endpoint {endpoint} returned status {response.status_code}")
            except (httpx.TimeoutException, httpx.TransportError) as exc:
                logger.warning(f"Overpass endpoint {endpoint} failed: {exc}")
                continue
        return None

    # ------------------------------------------------------------
    # Parsing / ranking
    # ------------------------------------------------------------

    @staticmethod
    def _bucket_and_tag(tags: Dict[str, str]) -> Optional[Tuple[str, str, int]]:
        for bucket, spec in _CATEGORY_SPECS.items():
            for key, value_regex in spec["queries"]:
                value = tags.get(key)
                if value and re.fullmatch(value_regex, value):
                    priority = _TOURISM_TAG_PRIORITY.get(value, 1) if key == "tourism" else 1
                    return bucket, f"{key}={value}", priority
        return None

    def _parse_elements(self, elements: List[dict]) -> Dict[str, List[Spot]]:
        buckets: Dict[str, List[Spot]] = {cat: [] for cat in _CATEGORY_SPECS}
        seen_names: set = set()

        def sort_key(el: dict) -> Tuple[int, int]:
            tags = el.get("tags", {})
            has_wiki = 1 if (tags.get("wikipedia") or tags.get("wikidata")) else 0
            bucket_info = self._bucket_and_tag(tags)
            priority = bucket_info[2] if bucket_info else 0
            return (-has_wiki, -priority)

        for el in sorted(elements, key=sort_key):
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name or name.lower() in seen_names:
                continue

            bucket_info = self._bucket_and_tag(tags)
            if not bucket_info:
                continue
            bucket, tag_str, _priority = bucket_info

            lat = el.get("lat", (el.get("center") or {}).get("lat"))
            lon = el.get("lon", (el.get("center") or {}).get("lon"))

            seen_names.add(name.lower())
            buckets[bucket].append(
                Spot(name=name, category=bucket, tag=tag_str, lat=lat, lon=lon, wikipedia=tags.get("wikipedia"))
            )

        return buckets

    # ------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------

    async def fetch_spots(
        self,
        destination: str,
        categories: Optional[List[str]] = None,
        limit_per_category: int = 5,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Return up to `limit_per_category` named, real points of interest per
        bucket ("attractions", "nature", "food", "shopping") near `destination` or lat/lon.
        """
        if not destination or not destination.strip():
            if lat is None or lon is None:
                return {cat: [] for cat in _CATEGORY_SPECS}

        categories = categories or list(_CATEGORY_SPECS.keys())
        dest_key = destination.strip().lower() if destination else f"{lat:.4f},{lon:.4f}"
        cache_key = f"{dest_key}:{','.join(sorted(categories))}"

        now = datetime.now(timezone.utc)
        cached = self._cache.get(cache_key)
        if cached:
            cached_time, cached_result = cached
            if now - cached_time < timedelta(hours=self.cache_ttl_hours):
                logger.info(f"Destination spots cache hit for '{dest_key}'.")
                return {k: v[:limit_per_category] for k, v in cached_result.items()}

        empty_result = {cat: [] for cat in _CATEGORY_SPECS}

        try:
            async with httpx.AsyncClient(timeout=self.request_timeout_seconds, follow_redirects=True) as client:
                target_lat, target_lon = None, None
                if lat is not None and lon is not None:
                    target_lat, target_lon = lat, lon
                else:
                    coords = await self._geocode(client, destination)
                    if coords:
                        target_lat, target_lon = coords

                if target_lat is None or target_lon is None:
                    logger.info(f"Could not geocode destination '{destination}'; returning no spots.")
                    return empty_result

                query = self._build_overpass_query(target_lat, target_lon, categories)
                elements = await self._run_overpass_query(client, query)
                if elements is None:
                    return empty_result

                buckets = self._parse_elements(elements)

        except Exception as exc:
            logger.warning(f"Destination spot lookup failed for '{destination}': {exc}")
            return empty_result

        result = {cat: [s.to_dict() for s in spots] for cat, spots in buckets.items()}
        self._cache[cache_key] = (now, result)
        self._evict_cache_if_full()

        return {k: v[:limit_per_category] for k, v in result.items()}

    def _evict_cache_if_full(self) -> None:
        if len(self._cache) <= MAX_CACHE_ENTRIES:
            return
        oldest_keys = sorted(self._cache, key=lambda k: self._cache[k][0])[: len(self._cache) - MAX_CACHE_ENTRIES]
        for key in oldest_keys:
            del self._cache[key]


destination_spots_service = DestinationSpotsService()
