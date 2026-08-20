"""
Wikipedia place-information service.

Given a place/landmark name (the same query used against BingImageScraper),
this resolves the correct Wikipedia article, pulls a clean summary + longer
extract, and makes a best-effort attempt to surface two things Wikipedia
does NOT structurally guarantee for a landmark: opening/closing hours and
ticket/entry price. Those two fields are extracted heuristically from the
free-text article body (regex + keyword proximity) because Wikipedia has no
reliable "opening_hours" / "ticket_price" infobox field for most monuments,
temples, museums, etc. They are always returned with an explicit
`available` flag and a confidence level — never fabricated — so the caller
can decide whether to show them or fall back to an official source.

Design mirrors BingImageScraper: dataclasses for structured results, an
in-memory TTL cache, bounded retries with backoff, and a single public
async entrypoint.
"""

import re
import urllib.parse
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

import httpx

from app.core.logging_config import logger

WIKIPEDIA_API_BASE = "https://en.wikipedia.org/w/api.php"
WIKIPEDIA_REST_SUMMARY_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary"

REQUEST_TIMEOUT_SECONDS = 10.0
MAX_RETRIES = 2
CACHE_TTL_MINUTES = 240  # article content changes far less often than image search results
MAX_CACHE_ENTRIES = 500

CONTENT_CHAR_LIMIT = 2500  # how much of the full extract we surface as "content"
SCAN_CHAR_LIMIT = 20000    # how much of the full extract we scan for hours/price mentions

PRACTICAL_INFO_DISCLAIMER = (
    "Sourced from Wikipedia article text, not an official listing. "
    "Hours and prices can change — verify with the official site before visiting."
)

# ---------------------------------------------------------------------------
# Heuristic extraction patterns for opening hours / ticket price
# ---------------------------------------------------------------------------

_HOURS_CONTEXT_KEYWORDS = re.compile(
    r"(opening hours|visiting hours|visitor hours|open daily|open from|open to (the )?public|"
    r"hours of operation|timings|closed on|open on all days|remains open|opens at|closes at)",
    re.IGNORECASE,
)

_TIME_RANGE_PATTERN = re.compile(
    r"\b\d{1,2}(:\d{2})?\s?(am|pm|AM|PM)?\s?(to|-|–|—)\s?\d{1,2}(:\d{2})?\s?(am|pm|AM|PM)\b"
)

_PRICE_CONTEXT_KEYWORDS = re.compile(
    r"(entry fee|entrance fee|admission fee|ticket price|admission price|"
    r"entry ticket|entrance ticket|free entry|free admission|no entry fee|"
    r"tickets? (cost|are priced|are available))",
    re.IGNORECASE,
)

_CURRENCY_AMOUNT_PATTERN = re.compile(
    r"(₹|Rs\.?|INR|\$|USD|£|GBP|€|EUR)\s?\d[\d,]*(\.\d+)?"
)

_SENTENCE_SPLIT_PATTERN = re.compile(r"(?<=[.!?])\s+")


@dataclass
class PracticalInfo:
    available: bool
    raw_mentions: List[str]
    confidence: str  # "none" | "low" | "medium"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "available": self.available,
            "mentions": self.raw_mentions,
            "confidence": self.confidence,
        }


class WikipediaLookupError(Exception):
    """Raised when Wikipedia cannot resolve or fetch a page for the query."""


class WikipediaPlaceInfoService:
    """Resolves a place name to Wikipedia content plus best-effort practical info."""

    def __init__(
        self,
        cache_ttl_minutes: int = CACHE_TTL_MINUTES,
        request_timeout_seconds: float = REQUEST_TIMEOUT_SECONDS,
        max_retries: int = MAX_RETRIES,
    ):
        self._cache: Dict[str, Tuple[datetime, Dict[str, Any]]] = {}
        self.cache_ttl_minutes = cache_ttl_minutes
        self.request_timeout_seconds = request_timeout_seconds
        self.max_retries = max_retries

    # ------------------------------------------------------------
    # Networking helpers
    # ------------------------------------------------------------

    async def _get_json(self, client: httpx.AsyncClient, url: str, params: Optional[Dict[str, Any]] = None) -> Optional[dict]:
        import asyncio

        last_error: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    return response.json()
                if response.status_code == 404:
                    return None
                logger.warning(f"Wikipedia request to {url} returned status {response.status_code}")
                return None
            except (httpx.TimeoutException, httpx.TransportError) as exc:
                last_error = exc
                if attempt < self.max_retries:
                    await asyncio.sleep(0.4 * (2 ** attempt))
                    continue
        if last_error:
            logger.warning(f"Wikipedia request to {url} failed after retries: {last_error}")
        return None

    # ------------------------------------------------------------
    # Title resolution
    # ------------------------------------------------------------

    async def _resolve_title(self, client: httpx.AsyncClient, query: str) -> Optional[str]:
        """Use MediaWiki search to find the best-matching, non-disambiguation title."""
        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": 5,
        }
        data = await self._get_json(client, WIKIPEDIA_API_BASE, params=params)
        if not data:
            return None

        hits = data.get("query", {}).get("search", [])
        if not hits:
            return None

        # Prefer the first result whose snippet doesn't flag it as a
        # disambiguation page; otherwise fall back to the top hit.
        for hit in hits:
            snippet = hit.get("snippet", "").lower()
            if "may refer to" not in snippet and "disambiguation" not in hit.get("title", "").lower():
                return hit["title"]
        return hits[0]["title"]

    # ------------------------------------------------------------
    # Content fetching
    # ------------------------------------------------------------

    async def _fetch_summary(self, client: httpx.AsyncClient, title: str) -> Optional[dict]:
        encoded_title = urllib.parse.quote(title.replace(" ", "_"))
        url = f"{WIKIPEDIA_REST_SUMMARY_BASE}/{encoded_title}"
        return await self._get_json(client, url)

    async def _fetch_full_extract(self, client: httpx.AsyncClient, title: str) -> Optional[str]:
        params = {
            "action": "query",
            "prop": "extracts",
            "explaintext": 1,
            "redirects": 1,
            "titles": title,
            "format": "json",
        }
        data = await self._get_json(client, WIKIPEDIA_API_BASE, params=params)
        if not data:
            return None
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            extract = page.get("extract")
            if extract:
                return extract
        return None

    # ------------------------------------------------------------
    # Practical-info heuristics
    # ------------------------------------------------------------

    @staticmethod
    def _sentences_matching(text: str, context_pattern: re.Pattern, value_pattern: Optional[re.Pattern] = None) -> List[str]:
        matches: List[str] = []
        for sentence in _SENTENCE_SPLIT_PATTERN.split(text):
            if context_pattern.search(sentence) and (value_pattern is None or value_pattern.search(sentence) or context_pattern.search(sentence)):
                cleaned = sentence.strip()
                if cleaned and cleaned not in matches:
                    matches.append(cleaned)
            if len(matches) >= 3:
                break
        return matches

    def _extract_opening_hours(self, text: str) -> PracticalInfo:
        scoped_text = text[:SCAN_CHAR_LIMIT]
        mentions = self._sentences_matching(scoped_text, _HOURS_CONTEXT_KEYWORDS)
        if not mentions:
            return PracticalInfo(available=False, raw_mentions=[], confidence="none")
        has_explicit_time = any(_TIME_RANGE_PATTERN.search(m) for m in mentions)
        confidence = "medium" if has_explicit_time else "low"
        return PracticalInfo(available=True, raw_mentions=mentions, confidence=confidence)

    def _extract_ticket_price(self, text: str) -> PracticalInfo:
        scoped_text = text[:SCAN_CHAR_LIMIT]
        mentions = self._sentences_matching(scoped_text, _PRICE_CONTEXT_KEYWORDS)
        if not mentions:
            return PracticalInfo(available=False, raw_mentions=[], confidence="none")
        has_amount = any(_CURRENCY_AMOUNT_PATTERN.search(m) for m in mentions)
        confidence = "medium" if has_amount else "low"
        return PracticalInfo(available=True, raw_mentions=mentions, confidence=confidence)

    # ------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------

    async def fetch_place_info(self, query: str) -> Dict[str, Any]:
        """
        Resolve `query` to a Wikipedia article and return summary content
        plus best-effort opening hours / ticket price mentions.

        Always returns a dict, even on failure — check `found` before
        relying on the rest of the fields.
        """
        if not query or not query.strip():
            return {"found": False, "query": query}

        search_term = query.strip()
        cache_key = search_term.lower()

        now = datetime.now(timezone.utc)
        cached = self._cache.get(cache_key)
        if cached:
            cached_time, cached_result = cached
            if now - cached_time < timedelta(minutes=self.cache_ttl_minutes):
                logger.info(f"Wikipedia info cache hit for query '{search_term}'.")
                return cached_result

        result: Dict[str, Any] = {"found": False, "query": search_term}

        try:
            headers = {
                "User-Agent": "NearbyApp/1.0 (https://nearby.app; contact@nearby.app) Python/3.13 httpx/0.27"
            }
            async with httpx.AsyncClient(headers=headers, timeout=self.request_timeout_seconds, follow_redirects=True) as client:
                title = await self._resolve_title(client, search_term)
                
                # Fallback: if query with parentheses returns no title, strip parentheses
                if not title and '(' in search_term:
                    clean_query = re.sub(r'\(.*?\)', '', search_term).strip()
                    if clean_query:
                        title = await self._resolve_title(client, clean_query)

                if not title:
                    logger.info(f"No Wikipedia article resolved for query '{search_term}'.")
                    return result

                summary = await self._fetch_summary(client, title)
                if summary and summary.get("type") == "disambiguation":
                    # Rare: search resolution still landed on a disambiguation
                    # page. Bail out clearly rather than return the wrong info.
                    logger.info(f"Wikipedia resolved '{search_term}' to a disambiguation page; skipping.")
                    return result

                full_extract = await self._fetch_full_extract(client, title)
                scan_text = full_extract or (summary.get("extract") if summary else "") or ""

                opening_hours = self._extract_opening_hours(scan_text)
                ticket_price = self._extract_ticket_price(scan_text)

                coordinates = None
                if summary and summary.get("coordinates"):
                    coordinates = {
                        "lat": summary["coordinates"].get("lat"),
                        "lon": summary["coordinates"].get("lon"),
                    }

                wiki_url = (
                    summary.get("content_urls", {}).get("desktop", {}).get("page")
                    if summary
                    else f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
                )
                content_text = (full_extract or "")[:CONTENT_CHAR_LIMIT].strip()

                result = {
                    "found": True,
                    "query": search_term,
                    "title": summary.get("title") if summary else title,
                    "wikipedia_url": wiki_url,
                    "wiki_url": wiki_url,
                    "description": summary.get("description") if summary else None,
                    "summary": summary.get("extract") if summary else None,
                    "content": content_text,
                    "history": content_text,
                    "thumbnail_url": summary.get("thumbnail", {}).get("source") if summary and summary.get("thumbnail") else None,
                    "coordinates": coordinates,
                    "opening_hours": opening_hours.to_dict(),
                    "ticket_price": ticket_price.to_dict(),
                    "practical_info_disclaimer": PRACTICAL_INFO_DISCLAIMER,
                }

        except Exception as exc:  # defensive: never let this crash the caller
            logger.warning(f"Wikipedia info lookup failed for query '{search_term}': {exc}")
            return {"found": False, "query": search_term}

        if result.get("found"):
            self._cache[cache_key] = (now, result)
            self._evict_cache_if_full()

        return result

    def _evict_cache_if_full(self) -> None:
        if len(self._cache) <= MAX_CACHE_ENTRIES:
            return
        oldest_keys = sorted(self._cache, key=lambda k: self._cache[k][0])[: len(self._cache) - MAX_CACHE_ENTRIES]
        for key in oldest_keys:
            del self._cache[key]


wikipedia_place_info_service = WikipediaPlaceInfoService()


async def get_place_details(place_name: str, image_limit: int = 6) -> Dict[str, Any]:
    """Fetch Bing images and Wikipedia info for the same place concurrently."""
    import asyncio
    from app.scrapers.bing_image_scraper import bing_image_scraper

    images_task = bing_image_scraper.fetch_images(place_name, limit=image_limit)
    info_task = wikipedia_place_info_service.fetch_place_info(place_name)
    images, info = await asyncio.gather(images_task, info_task)

    return {
        "place": place_name,
        "images": images,
        "info": info,
    }
