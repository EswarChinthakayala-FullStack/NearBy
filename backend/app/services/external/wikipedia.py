from typing import Any, Dict, Optional
from app.core.config import settings
from app.services.external.base import BaseExternalClient, ExternalServiceException


class WikipediaClient(BaseExternalClient):
    """Wikipedia REST API client for place descriptions and historical details."""

    def __init__(self):
        super().__init__(
            base_url=settings.WIKIPEDIA_API_URL,
            service_name="Wikipedia REST API"
        )

    async def search_article(self, query: str) -> Optional[str]:
        """Search Wikipedia Action API for the best matching article title."""
        if not query or not query.strip():
            return None

        clean_query = query.replace("(", " ").replace(")", " ").strip()
        search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={clean_query}&format=json&utf8=1&srlimit=1"

        try:
            res = await self.client.get(search_url)
            if res.status_code == 200:
                data = res.json()
                results = data.get("query", {}).get("search", [])
                if results:
                    return results[0].get("title")
        except Exception:
            pass

        return None

    async def get_page_summary(self, title: str) -> Optional[Dict[str, Any]]:
        """Fetch article summary by Wikipedia page title with fallback search."""
        resolved_title = await self.search_article(title) or title.strip()
        formatted_title = resolved_title.strip().replace(" ", "_")

        try:
            data = await self.get(f"page/summary/{formatted_title}")
            return {
                "title": data.get("title"),
                "display_title": data.get("displaytitle"),
                "description": data.get("description"),
                "extract": data.get("extract"),
                "thumbnail_url": data.get("thumbnail", {}).get("source") if data.get("thumbnail") else None,
                "original_image_url": data.get("originalimage", {}).get("source") if data.get("originalimage") else None,
                "content_urls": data.get("content_urls", {}).get("desktop", {}).get("page")
            }
        except Exception:
            return None
