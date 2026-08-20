import json
from typing import List, Optional
from urllib.parse import unquote
import httpx
import redis.asyncio as aioredis
from fastapi import APIRouter, Query, HTTPException, Response
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.logging_config import logger
from app.core.circuit_breaker import source_circuit_breaker
from app.tasks.image_search_tasks import search_images_direct_async, search_images_chord

router = APIRouter()


class ImageSearchResult(BaseModel):
    thumbnail_url: str = Field(..., description="Proxy or CDN URL of the thumbnail image")
    source_url: str = Field(..., description="Original full-resolution target image URL")
    title: str = Field(..., description="Title or alt description of the image")
    width: int = Field(0, description="Image width in pixels")
    height: int = Field(0, description="Image height in pixels")
    source_site: str = Field(..., description="Search engine origin (bing, duckduckgo, google)")


@router.get("/search", response_model=List[ImageSearchResult], summary="Search images across keyless multi-source backends")
async def search_images_endpoint(
    q: str = Query(..., min_length=1, description="Text query to search for images"),
    page: int = Query(1, ge=1, description="Pagination page number")
):
    """
    Search images without external API keys.
    Checks 6-hour Redis cache first; on miss runs parallel scrapers across Bing, DuckDuckGo, and Google.
    """
    clean_q = q.strip()
    cache_key = f"imgsearch:{clean_q.lower()}:{page}"

    # 1. Redis Cache Lookup
    try:
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=1.0)
        cached_data = await r.get(cache_key)
        await r.aclose()
        if cached_data:
            logger.info(f"Redis cache hit for image search query '{clean_q}', page {page}")
            return json.loads(cached_data)
    except Exception as cache_err:
        logger.debug(f"Redis lookup error for image search ({cache_err}). Proceeding to live search.")

    # 2. Execute parallel multi-source scraping
    try:
        # Try Celery chord first if available, or fall back to direct async gathering
        try:
            job = search_images_chord(clean_q, page)
            # Wait up to 12s for chord completion
            results = job.get(timeout=12.0)
            if results:
                return results
        except Exception as chord_err:
            logger.debug(f"Celery chord wait bypassed/timed out ({chord_err}). Running direct async scraper engine.")

        results = await search_images_direct_async(clean_q, page)
        return results

    except Exception as exc:
        logger.error(f"Image search failed for query '{clean_q}': {exc}", exc_info=True)
        raise HTTPException(status_code=504, detail="Search backends timed out or failed to return results.")


@router.get("/thumb", summary="Proxy image thumbnail to prevent CDN hotlinking restrictions")
async def proxy_thumbnail(
    url: str = Query(..., description="Target image URL to proxy"),
    source: Optional[str] = Query(None, description="Source name for customized Referer headers")
):
    """
    Proxy thumbnail requests so frontends avoid CORS/hotlinking blocks from external CDNs.
    Sends realistic User-Agent and source-appropriate Referer headers.
    """
    target_url = unquote(url)
    if not target_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid target image URL schema")

    # Pick appropriate Referer based on source
    referer = "https://www.google.com/"
    if source == "bing":
        referer = "https://www.bing.com/"
    elif source == "duckduckgo":
        referer = "https://duckduckgo.com/"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": referer,
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    }

    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(target_url, headers=headers)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="Unable to fetch remote thumbnail")

            content_type = resp.headers.get("content-type", "image/jpeg")
            return Response(
                content=resp.content,
                media_type=content_type,
                headers={"Cache-Control": "public, max-age=86400"}
            )
    except httpx.HTTPError as e:
        logger.warning(f"Thumbnail proxy fetch failed for {target_url}: {e}")
        raise HTTPException(status_code=502, detail=f"Thumbnail proxy request failed: {str(e)}")


@router.get("/circuit-breaker", summary="Check operational status and circuit breaker stats of scrapers")
async def get_circuit_breaker_status():
    """Returns availability stats and failure history for each search backend scraper."""
    return {
        "bing": source_circuit_breaker.get_stats("bing"),
        "duckduckgo": source_circuit_breaker.get_stats("duckduckgo"),
        "google": source_circuit_breaker.get_stats("google"),
    }
