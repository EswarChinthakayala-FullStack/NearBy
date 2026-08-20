import json
from collections import defaultdict
from typing import List, Dict, Any, Optional
from urllib.parse import quote, urlparse
import redis

from app.core.config import settings
from app.core.logging_config import logger


def normalize_url(url: str) -> str:
    """Normalize source URL for deduplication by stripping query parameters and lowercasing."""
    if not url:
        return ""
    try:
        parsed = urlparse(url)
        # Reconstruct without query string or fragment
        normalized = f"{parsed.scheme.lower()}://{parsed.netloc.lower()}{parsed.path}"
        return normalized.rstrip("/")
    except Exception:
        return url.split("?")[0].lower()


def build_proxy_thumb_url(raw_url: str, source: str) -> str:
    """Wrap raw CDN thumbnail URL into proxy endpoint URL."""
    if not raw_url:
        return ""
    encoded = quote(raw_url, safe="")
    return f"{settings.API_V1_STR}/images/thumb?url={encoded}&source={source}"


def aggregate_image_results(
    results_list: List[List[Dict[str, Any]]],
    query: str,
    page: int = 1
) -> List[Dict[str, Any]]:
    """
    Merge results from multiple search providers, deduplicate by normalized URL,
    rank by resolution, interleave by provider source, and cache in Redis.
    """
    # Merge list of lists into a flat list
    flat_results = [item for source_results in results_list for item in source_results]

    if not flat_results:
        logger.info(f"[Aggregator] No image results gathered from any source for query '{query}'.")
        return []

    # 1. Deduplicate by normalized source_url
    seen_urls = set()
    deduped: List[Dict[str, Any]] = []
    for item in flat_results:
        src_url = item.get("source_url") or item.get("image_url") or ""
        norm = normalize_url(src_url)
        if norm and norm not in seen_urls:
            seen_urls.add(norm)
            # Ensure proper thumbnail proxy formatting option
            raw_thumb = item.get("thumbnail_url") or src_url
            source_site = item.get("source_site") or item.get("source") or "unknown"
            
            deduped.append({
                "thumbnail_url": build_proxy_thumb_url(raw_thumb, source_site),
                "raw_thumbnail_url": raw_thumb,
                "source_url": src_url,
                "title": item.get("title") or query,
                "width": int(item.get("width") or 0),
                "height": int(item.get("height") or 0),
                "source_site": source_site,
            })

    # 2. Rank candidates by resolution (width * height) descending
    def resolution_score(item: Dict[str, Any]) -> int:
        return (item.get("width") or 0) * (item.get("height") or 0)

    deduped.sort(key=resolution_score, reverse=True)

    # 3. Interleave sources so no single engine dominates feed
    by_source: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for item in deduped:
        by_source[item["source_site"]].append(item)

    interleaved: List[Dict[str, Any]] = []
    while any(by_source.values()):
        for src in list(by_source.keys()):
            if by_source[src]:
                interleaved.append(by_source[src].pop(0))

    # 4. Cache final results per query & page in Redis (6 hours TTL = 21600 seconds)
    try:
        r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1.0)
        cache_key = f"imgsearch:{query.strip().lower()}:{page}"
        r.setex(cache_key, 21600, json.dumps(interleaved))
        logger.info(f"[Aggregator] Cached {len(interleaved)} aggregated images under Redis key '{cache_key}' (TTL 6h).")
    except Exception as cache_err:
        logger.debug(f"[Aggregator] Redis cache write exception: {cache_err}")

    return interleaved
