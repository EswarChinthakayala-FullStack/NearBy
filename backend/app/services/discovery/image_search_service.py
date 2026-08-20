import logging
from typing import Optional
from app.core.cache import cache_manager
from app.models.place import Place
from app.scrapers.bing_image_scraper import bing_image_scraper
from app.scrapers.wikimedia_fetcher import wikimedia_fetcher
from app.utils.image_helpers import get_place_cover_image

logger = logging.getLogger(__name__)

class ImageSearchService:
    """Caching image search service resolving place slugs to image URLs."""

    async def get_cached_place_image(self, place: Place) -> str:
        slug = place.slug or f"place-{place.id}"
        cache_key = f"place:image:{slug}"

        # 1. Check cache first
        cached = await cache_manager.get(cache_key)
        if cached:
            return cached

        # 2. Check if DB has cover image already
        cover_db = get_place_cover_image(place)
        
        # If the DB has images associated, return it and cache it
        if "images" in place.__dict__ and place.images and len(place.images) > 0:
            if cover_db:
                await cache_manager.set(cache_key, cover_db, ttl=604800)
                return cover_db

        # 3. Cache Miss: Run keyless search query
        try:
            query = f"{place.name} {place.city or place.state or ''}".strip()
            # Search Wikimedia first
            candidates = await wikimedia_fetcher.fetch_images(query=query, limit=1)
            if not candidates:
                # Fallback to Bing Image scraper
                candidates = await bing_image_scraper.fetch_images(query=query, limit=1)
            
            if candidates and len(candidates) > 0:
                img_url = candidates[0].get("image_url") or candidates[0].get("thumbnail_url")
                if img_url:
                    await cache_manager.set(cache_key, img_url, ttl=604800)
                    return img_url
        except Exception as e:
            logger.warning(f"Failed to fetch live image for place '{place.name}': {e}")

        # 4. Fallback to default/category placeholder
        return cover_db

image_search_service = ImageSearchService()
