from typing import Any, Dict, List
from app.core.config import settings
from app.services.external.base import BaseExternalClient


class WikimediaClient(BaseExternalClient):
    """Wikimedia Commons API client for license-attributed place gallery photos."""

    def __init__(self):
        super().__init__(
            base_url=settings.WIKIMEDIA_COMMONS_API_URL,
            service_name="Wikimedia Commons API"
        )

    async def search_images(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search Wikimedia Commons media for a query term."""
        params = {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": f"File:{query}",
            "gsrnamespace": "6",  # Media file namespace
            "gsrlimit": str(limit),
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata|mime"
        }

        data = await self.get(params=params)
        pages = data.get("query", {}).get("pages", {})

        images = []
        for page_id, page_info in pages.items():
            image_info_list = page_info.get("imageinfo", [])
            if not image_info_list:
                continue

            info = image_info_list[0]
            metadata = info.get("extmetadata", {})

            # Filter for JPEG/PNG images
            mime = info.get("mime", "")
            if not mime.startswith("image/"):
                continue

            images.append({
                "file_name": page_info.get("title"),
                "image_url": info.get("url"),
                "thumbnail_url": info.get("thumburl") or info.get("url"),
                "width": info.get("width"),
                "height": info.get("height"),
                "artist": metadata.get("Artist", {}).get("value"),
                "license": metadata.get("LicenseShortName", {}).get("value"),
                "attribution_url": metadata.get("LicenseUrl", {}).get("value")
            })

        return images
