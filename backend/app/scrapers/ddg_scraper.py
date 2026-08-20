import re
import time
import random
from typing import List, Dict, Any
from urllib.parse import quote
import httpx

from app.core.logging_config import logger
from app.core.circuit_breaker import source_circuit_breaker

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
]


async def scrape_duckduckgo_images(query: str, page_num: int = 1) -> List[Dict[str, Any]]:
    """
    Scrape image search results from DuckDuckGo Images.
    Uses the two-step vqd token extraction + i.js API fetch.
    """
    source_name = "duckduckgo"
    if not query or not query.strip():
        return []

    if not source_circuit_breaker.is_available(source_name):
        logger.warning(f"[DDGScraper] Source '{source_name}' is currently unavailable (circuit breaker open).")
        return []

    start_time = time.time()
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://duckduckgo.com/",
    }

    try:
        async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=12.0) as client:
            # Step 1: Fetch main DDG HTML to extract token
            init_url = f"https://duckduckgo.com/?q={quote(query)}&iax=images&ia=images"
            resp_html = await client.get(init_url)
            if resp_html.status_code != 200:
                source_circuit_breaker.record_failure(source_name, error=f"HTTP {resp_html.status_code} on initial page")
                return []

            html_text = resp_html.text
            vqd_match = re.search(r"vqd=([\d-]+)&", html_text) or re.search(r'vqd=["\']([\d-]+)["\']', html_text) or re.search(r'vqd:\s*"([\d-]+)"', html_text)
            if not vqd_match:
                logger.warning(f"[DDGScraper] Failed to extract vqd token for query '{query}'")
                source_circuit_breaker.record_failure(source_name, error="vqd token match failed")
                return []

            vqd = vqd_match.group(1)

            # Step 2: Query DDG internal JSON endpoint
            params = {
                "l": "us-en",
                "o": "json",
                "q": query,
                "vqd": vqd,
                "f": ",,,",
                "p": str(page_num),
            }
            api_resp = await client.get("https://duckduckgo.com/i.js", params=params)
            if api_resp.status_code != 200:
                source_circuit_breaker.record_failure(source_name, error=f"HTTP {api_resp.status_code} on i.js API")
                return []

            data = api_resp.json()
            raw_results = data.get("results", [])

            results: List[Dict[str, Any]] = []
            for r in raw_results:
                image_url = r.get("image")
                if not image_url:
                    continue
                results.append({
                    "thumbnail_url": r.get("thumbnail") or image_url,
                    "source_url": image_url,
                    "title": r.get("title") or query,
                    "width": r.get("width") or 0,
                    "height": r.get("height") or 0,
                    "source_site": "duckduckgo",
                })

            latency = time.time() - start_time
            source_circuit_breaker.record_success(source_name, count=len(results), latency=latency)
            return results

    except Exception as e:
        logger.error(f"[DDGScraper] Error scraping DuckDuckGo Images for '{query}': {e}")
        source_circuit_breaker.record_failure(source_name, error=str(e))
        return []
