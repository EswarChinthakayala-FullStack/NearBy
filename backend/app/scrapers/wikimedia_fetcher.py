from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings
from app.core.exceptions import ExternalAPIException
from app.core.logging_config import logger

DISALLOWED_EXTENSIONS = {".svg", ".gif", ".tif", ".tiff", ".pdf", ".djvu"}


class WikimediaFetcher:
    """Wikimedia Commons API fetcher for high-quality tourist place images."""

    def __init__(
        self,
        base_url: str = "https://commons.wikimedia.org/w/api.php",
        timeout: float = settings.EXTERNAL_REQUEST_TIMEOUT_SECONDS
    ):
        self.base_url = base_url
        self.timeout = timeout

    async def fetch_images(
        self,
        query: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search Wikimedia Commons API and return normalized list of image objects."""
        if not query or not query.strip():
            return []

        search_term = query.strip()
        candidates = await self._do_fetch(search_term, limit)

        # Fallback 1: Try prefix / core landmark name (e.g. "Varasiddhi Vinayakar Temple" -> "Varasiddhi Vinayakar")
        if not candidates:
            import re
            clean_term = re.sub(r"\b(Palace|Fort|Temple|Koil|Kovil|Museum|Gate|Garden|Park|Beach)\b", "", search_term, flags=re.IGNORECASE).strip()
            if clean_term and clean_term != search_term:
                candidates = await self._do_fetch(clean_term, limit)

        # Fallback 2: Try first unique landmark keyword (e.g. "Varasiddhi" or "Vinayakar")
        if not candidates:
            words = [w for w in search_term.split() if len(w) > 4 and w.lower() not in {"temple", "palace", "museum", "hotel", "beach", "park"}]
            if words:
                candidates = await self._do_fetch(words[0], limit)

        return candidates

    async def _do_fetch(self, search_term: str, limit: int) -> List[Dict[str, Any]]:
        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": f"File:{search_term}",
            "gsrnamespace": "6",
            "gsrlimit": min(limit * 3, 30),
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata",
            "iiurlwidth": 800,
            "format": "json"
        }

        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 NearbyApp/1.0 (contact@nearbyapp.com)"}

        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=headers) as client:
                response = await client.get(self.base_url, params=params)

                if response.status_code != 200:
                    logger.warning(f"Wikimedia API returned status code {response.status_code}")
                    return []

                data = response.json()
                pages = data.get("query", {}).get("pages", {})

                results: List[Dict[str, Any]] = []

                for page_id, page_info in pages.items():
                    image_info_list = page_info.get("imageinfo", [])
                    if not image_info_list:
                        continue

                    img_meta = image_info_list[0]
                    orig_url = img_meta.get("url", "")
                    thumb_url = img_meta.get("thumburl")
                    best_url = thumb_url or orig_url
                    width = img_meta.get("width", 0)
                    height = img_meta.get("height", 0)
                    title = page_info.get("title", "").replace("File:", "")

                    item = {
                        "image_url": best_url,
                        "thumbnail_url": best_url,
                        "source": "wikimedia",
                        "title": title,
                        "width": width,
                        "height": height,
                        "attribution": "Wikimedia Commons"
                    }
                    results.append(item)

                    if len(results) >= limit:
                        break

                logger.info(f"Wikimedia fetcher retrieved {len(results)} candidate images for query '{search_term}'.")
                return results

        except Exception as e:
            logger.error(f"Wikimedia fetcher error for query '{search_term}': {str(e)}", exc_info=True)
            return []


wikimedia_fetcher = WikimediaFetcher()
