import json
import re
from typing import Any, Dict, List
from bs4 import BeautifulSoup
from app.core.config import settings
from app.services.external.base import BaseExternalClient


class BingImageClient(BaseExternalClient):
    """Supplementary Bing Image Search scraping client."""

    def __init__(self):
        super().__init__(
            base_url=settings.BING_IMAGE_SEARCH_URL,
            service_name="Bing Image Scraper"
        )
        self.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })

    async def search_images(self, query: str, count: int = 10) -> List[Dict[str, Any]]:
        """Scrape Bing Image Search results for a tourist place query."""
        params = {"q": query, "form": "HDRSC2"}

        try:
            # Override BaseExternalClient.get to handle HTML responses
            import httpx
            async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                html_content = response.text

            soup = BeautifulSoup(html_content, "html.parser")
            results = []

            # Bing images embed JSON metadata inside <a class="iusc" m="{...}">
            for anchor in soup.find_all("a", class_="iusc"):
                m_attr = anchor.get("m")
                if not m_attr:
                    continue
                try:
                    meta = json.loads(m_attr)
                    murl = meta.get("murl")  # Full resolution image URL
                    turl = meta.get("turl")  # Thumbnail URL
                    if murl:
                        results.append({
                            "image_url": murl,
                            "thumbnail_url": turl or murl,
                            "source": "bing"
                        })
                        if len(results) >= count:
                            break
                except Exception:
                    continue

            return results
        except Exception as e:
            # Fallback returning empty list on network or parse failure
            return []
