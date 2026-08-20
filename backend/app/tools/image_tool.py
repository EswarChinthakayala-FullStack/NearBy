import asyncio
import logging
from typing import Type, List, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.tools import BaseTool
from app.scrapers.bing_scraper import scrape_bing_images
from app.core.cache import cache_manager

logger = logging.getLogger(__name__)

class ImageSearchInput(BaseModel):
    query: str = Field(..., description="Destination or place name to search images for")

class ImageSearchTool(BaseTool):
    name: str = "image_search_tool"
    description: str = "Fetches high-resolution Bing image search results for places and destinations."
    args_schema: Type[BaseModel] = ImageSearchInput

    def _run(self, query: str) -> List[Dict[str, Any]]:
        return asyncio.run(self._arun(query))

    async def _arun(self, query: str) -> List[Dict[str, Any]]:
        cache_key = f"bing_img:{query.lower().strip()}"
        cached = await cache_manager.get(cache_key)
        if cached:
            return cached

        try:
            results = await scrape_bing_images(query=query)
            if results:
                await cache_manager.set(cache_key, results, ttl=86400)
                return results
        except Exception as e:
            logger.error(f"[ImageSearchTool] Bing image search error for '{query}': {e}")

        return []

image_search_tool = ImageSearchTool()
