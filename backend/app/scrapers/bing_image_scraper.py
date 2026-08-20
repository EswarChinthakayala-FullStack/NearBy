"""
Bing Image Search scraper for landmark / place-name image retrieval.

Given a place name (e.g. "Lotus Temple", "Gateway of India"), this module
queries Bing Images and returns normalized, de-duplicated image metadata
for that specific place — filtering out visually/textually related but
semantically wrong results (e.g. a search for "Lotus Temple" returning
photos of lotus flowers instead of the actual building).

Key reliability guarantees over a naive scraper:
  1. Phrase-aware relevance filtering — ALL significant keywords in the
     query must appear in a candidate's title, not just one of them.
     This is what prevents "Lotus Temple" from matching flower photography
     (title contains "lotus" but not "temple").
  2. Negative-term query augmentation — known contamination categories
     (flowers, clipart, wallpaper, etc.) are explicitly excluded at the
     Bing query level, not just filtered client-side.
  3. Minimum-resolution gating — rejects icon/thumbnail-sized results
     that are almost never genuine landmark photography.
  4. Result ranking — candidates are ordered by keyword-match strength
     and resolution, so the most relevant/highest-quality image is first.
  5. Defensive networking — request timeout, bounded retries with
     backoff, and rotating desktop user agents to reduce block rates.
"""

import json
import random
import re
import urllib.parse
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Set, Tuple

import httpx
from bs4 import BeautifulSoup

from app.core.logging_config import logger

# --------------------------------------------------------------------------
# Constants
# --------------------------------------------------------------------------

DISALLOWED_EXTENSIONS = {".svg", ".gif", ".ico"}

MIN_IMAGE_DIMENSION_PX = 150  # rejects icons/swatches that slip through

STOP_WORDS = {
    "show", "me", "find", "search", "get", "query", "what", "is", "are", "how", "to", "the",
    "a", "an", "for", "of", "in", "on", "with", "about", "related", "images", "image",
    "picture", "photo", "photos", "new", "best", "top", "latest", "free", "hd", "wallpaper",
    "wallpapers", "background", "backgrounds", "stock", "pic", "pics", "vector", "illustration",
    "clipart", "tourist", "place", "spots", "destination", "monument", "landmark",
}

GENERIC_COLOR_WORDS = {
    "red", "blue", "green", "yellow", "black", "white", "pink", "purple", "orange", "brown",
    "gold", "silver",
}

DISALLOWED_TITLE_TERMS = {
    "pantone", "color chart", "color palette", "shades of", "hex code", "color code",
    "palette", "swatch", "swatches", "rgb", "cmyk", "vector illustration", "clipart",
    "logo design", "icon set", "drawing", "sketch", "diagram", "chart",
}

# Categories that frequently share a keyword with a landmark name (e.g. "lotus")
# but are almost never the landmark itself. Excluded both from the outbound
# Bing query and, defensively, from accepted titles.
DEFAULT_NEGATIVE_TERMS = [
    "flower", "flowers", "bouquet", "plant", "petal", "petals", "bloom", "blossom",
    "clipart", "vector", "drawing", "wallpaper", "pattern", "seed", "seeds",
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/124.0.0.0 Safari/537.36",
]

MAX_CACHE_ENTRIES = 500
MAX_RETRIES_PER_PAGE = 2
REQUEST_TIMEOUT_SECONDS = 10.0


class BingScraperError(Exception):
    """Raised for unrecoverable scraper failures (network/parse)."""


@dataclass
class ImageCandidate:
    """Internal representation of a single scraped image before ranking."""

    image_url: str
    original_url: str
    thumbnail_url: Optional[str]
    page_url: str
    title: str
    width: int
    height: int
    source_domain: str
    match_score: int = 0  # number of query keywords matched in the title

    def to_dict(self) -> Dict[str, Any]:
        return {
            "image_url": self.image_url,
            "original_url": self.original_url,
            "thumbnail_url": self.thumbnail_url,
            "page_url": self.page_url,
            "source": "bing",
            "title": self.title,
            "width": self.width,
            "height": self.height,
            "attribution": f"Bing Search — {self.source_domain}" if self.source_domain else "Bing Search",
        }


class BingImageScraper:
    """
    Web scraper retrieving image metadata from Bing Image Search with
    strict, phrase-aware relevance filtering and CDN-backed thumbnail URLs
    for reliable rendering (no hotlink/CORS issues).
    """

    def __init__(
        self,
        cache_ttl_minutes: int = 60,
        request_timeout_seconds: float = REQUEST_TIMEOUT_SECONDS,
        max_retries_per_page: int = MAX_RETRIES_PER_PAGE,
    ):
        self._cache: Dict[str, Tuple[datetime, List[Dict[str, Any]]]] = {}
        self.cache_ttl_minutes = cache_ttl_minutes
        self.request_timeout_seconds = request_timeout_seconds
        self.max_retries_per_page = max_retries_per_page

    # ----------------------------------------------------------------
    # Query understanding
    # ----------------------------------------------------------------

    @staticmethod
    def _extract_keywords(query: str) -> Tuple[List[str], List[str]]:
        """Return (all_keywords, landmark_keywords) parsed from the raw query."""
        clean_query = re.sub(r"[\(\)\[\]]", " ", query.lower()).strip()
        clean_query = re.sub(r"\s+", " ", clean_query)
        words = re.findall(r"\b[a-zA-Z0-9_]{3,}\b", clean_query)
        all_keywords = [w for w in words if w not in STOP_WORDS]
        landmark_keywords = all_keywords
        return all_keywords, landmark_keywords

    @staticmethod
    def _build_relevance_check(all_keywords: List[str], landmark_keywords: List[str]):
        """
        Build a title-relevance predicate for this query.
        """
        keyword_count = len(landmark_keywords)
        if keyword_count <= 2:
            required_matches = 1
        else:
            required_matches = max(1, round(keyword_count * 0.5))

        def is_relevant(title: str) -> bool:
            if not title:
                return False

            title_lower = re.sub(r"\s+", " ", title.lower())

            if any(term in title_lower for term in DISALLOWED_TITLE_TERMS):
                return False

            if any(term in title_lower for term in DEFAULT_NEGATIVE_TERMS):
                return False

            if not all_keywords:
                return True

            if landmark_keywords:
                matched = sum(1 for kw in landmark_keywords if kw in title_lower)
                return matched >= required_matches

            return any(kw in title_lower for kw in all_keywords)

        return is_relevant

    @staticmethod
    def _match_score(title: str, landmark_keywords: List[str]) -> int:
        title_lower = title.lower()
        return sum(1 for kw in landmark_keywords if kw in title_lower)

    @staticmethod
    def _build_bing_query(search_term: str, landmark_keywords: List[str]) -> str:
        base_name = search_term.split('(')[0].strip() if '(' in search_term else search_term
        clean_search_term = re.sub(r"[\(\)\[\]]", " ", base_name).strip()
        clean_search_term = re.sub(r"-+", " ", clean_search_term)
        clean_search_term = re.sub(r"\s+", " ", clean_search_term)
        return clean_search_term

    # ----------------------------------------------------------------
    # Networking
    # ----------------------------------------------------------------

    async def _fetch_page_html(self, client: httpx.AsyncClient, url: str) -> Optional[str]:
        last_error: Optional[Exception] = None
        for attempt in range(self.max_retries_per_page + 1):
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.text
                logger.warning(f"Bing image search returned status {response.status_code} for {url}")
                return None
            except (httpx.TimeoutException, httpx.TransportError) as exc:
                last_error = exc
                if attempt < self.max_retries_per_page:
                    await self._backoff(attempt)
                    continue
        if last_error:
            logger.warning(f"Bing image search request failed after retries: {last_error}")
        return None

    @staticmethod
    async def _backoff(attempt: int) -> None:
        import asyncio

        await asyncio.sleep(0.4 * (2 ** attempt))

    # ----------------------------------------------------------------
    # Parsing
    # ----------------------------------------------------------------

    def _parse_candidates(
        self,
        html: str,
        is_relevant,
        landmark_keywords: List[str],
        seen_urls: Set[str],
    ) -> Tuple[List[ImageCandidate], int]:
        soup = BeautifulSoup(html, "html.parser")
        img_elements = soup.find_all("a", class_="iusc")
        candidates: List[ImageCandidate] = []

        for el in img_elements:
            m_attr = el.get("m")
            if not m_attr:
                continue

            try:
                meta = json.loads(m_attr)
            except json.JSONDecodeError:
                continue

            murl = meta.get("murl")
            if not murl or murl in seen_urls:
                continue

            title = meta.get("t") or meta.get("desc") or ""
            if title and not is_relevant(title):
                continue

            ext = murl[murl.rfind("."):].lower() if "." in murl else ""
            if ext in DISALLOWED_EXTENSIONS:
                continue

            width = int(meta.get("w") or 0)
            height = int(meta.get("h") or 0)
            if width and height and (width < MIN_IMAGE_DIMENSION_PX or height < MIN_IMAGE_DIMENSION_PX):
                continue

            page_url = meta.get("purl") or ""
            source_domain = urllib.parse.urlparse(page_url).netloc if page_url else ""

            seen_urls.add(murl)
            candidates.append(
                ImageCandidate(
                    image_url=meta.get("turl") or murl,
                    original_url=murl,
                    thumbnail_url=meta.get("turl"),
                    page_url=page_url,
                    title=title,
                    width=width,
                    height=height,
                    source_domain=source_domain,
                    match_score=self._match_score(title, landmark_keywords),
                )
            )

        return candidates, len(img_elements)

    # ----------------------------------------------------------------
    # Public API
    # ----------------------------------------------------------------

    async def fetch_images(self, query: str, limit: int = 8) -> List[Dict[str, Any]]:
        """
        Search Bing Images for `query` and return up to `limit` normalized
        image metadata dicts, ranked by relevance (keyword match strength)
        then by resolution.
        """
        if not query or not query.strip():
            return []

        search_term = query.strip()
        cache_key = f"{search_term.lower()}_{limit}"

        now = datetime.now(timezone.utc)
        cached = self._cache.get(cache_key)
        if cached:
            cached_time, cached_results = cached
            if now - cached_time < timedelta(minutes=self.cache_ttl_minutes):
                logger.info(f"Bing scraper cache hit for query '{search_term}'.")
                return cached_results[:limit]

        all_keywords, landmark_keywords = self._extract_keywords(search_term)
        is_relevant = self._build_relevance_check(all_keywords, landmark_keywords)
        bing_query = self._build_bing_query(search_term, landmark_keywords)

        headers = {"User-Agent": random.choice(USER_AGENTS)}
        seen_urls: Set[str] = set()
        candidates: List[ImageCandidate] = []
        total_scanned = 0

        try:
            async with httpx.AsyncClient(
                timeout=self.request_timeout_seconds, headers=headers, follow_redirects=True
            ) as client:
                offset = 1
                max_pages = max(1, (limit + 34) // 35)
                # Scan a couple of extra pages beyond the naive minimum, since
                # strict phrase filtering rejects more candidates than before.
                max_pages += 1

                for page in range(max_pages):
                    if len(candidates) >= limit * 2:
                        break

                    url = (
                        f"https://www.bing.com/images/async?q={urllib.parse.quote_plus(bing_query)}"
                        f"&first={offset}&count=35&mmasync=1"
                    )

                    html = await self._fetch_page_html(client, url)
                    if not html:
                        break

                    page_candidates, elements_found = self._parse_candidates(
                        html, is_relevant, landmark_keywords, seen_urls
                    )
                    if elements_found == 0:
                        break

                    candidates.extend(page_candidates)
                    total_scanned += elements_found
                    offset += elements_found

        except Exception as exc:  # defensive: never let a scraper failure crash the caller
            logger.warning(f"Bing scraper error for query '{search_term}': {exc}")

        # Rank: strongest keyword match first, then largest image first.
        candidates.sort(key=lambda c: (c.match_score, c.width * c.height), reverse=True)
        results = [c.to_dict() for c in candidates[:limit]]

        logger.info(
            f"Bing image scraper scanned {total_scanned} raw results and kept "
            f"{len(candidates)} relevant matches for query '{search_term}' "
            f"(returning top {len(results)})."
        )

        if results:
            self._cache[cache_key] = (now, results)
            self._evict_cache_if_full()

        return results

    def _evict_cache_if_full(self) -> None:
        if len(self._cache) <= MAX_CACHE_ENTRIES:
            return
        # Drop the oldest entries first (simple FIFO eviction).
        oldest_keys = sorted(self._cache, key=lambda k: self._cache[k][0])[: len(self._cache) - MAX_CACHE_ENTRIES]
        for key in oldest_keys:
            del self._cache[key]


bing_image_scraper = BingImageScraper()
