import json
import re
import time
import random
from typing import List, Dict, Any
from urllib.parse import quote
import httpx
from bs4 import BeautifulSoup

from app.core.logging_config import logger
from app.core.circuit_breaker import source_circuit_breaker

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
]


async def scrape_google_images(query: str, page_num: int = 1) -> List[Dict[str, Any]]:
    """
    Scrape image search results from Google Images (Bonus Source).
    Parses embedded script tags containing AF_initDataCallback or image URLs.
    Treated as optional/fragile.
    """
    source_name = "google"
    if not query or not query.strip():
        return []

    if not source_circuit_breaker.is_available(source_name):
        logger.warning(f"[GoogleScraper] Source '{source_name}' is currently unavailable (circuit breaker open).")
        return []

    start_time = time.time()
    url = f"https://www.google.com/search?q={quote(query)}&tbm=isch"
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    results: List[Dict[str, Any]] = []

    try:
        async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=10.0) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                source_circuit_breaker.record_failure(source_name, error=f"HTTP status {resp.status_code}")
                return []

            html = resp.text

            # Strategy 1: Extract image arrays from AF_initDataCallback scripts
            pattern = re.compile(r"AF_initDataCallback\({.*?data:(\[.*?\])\s*,\s*sideChannel:", re.DOTALL)
            matches = pattern.findall(html)

            found_urls = set()
            for m in matches:
                try:
                    # Find HTTP/HTTPS image links in data blob
                    img_matches = re.findall(r'(https?://[^"\']+\.(?:jpg|jpeg|png|webp))', m)
                    for img_url in img_matches:
                        if "gstatic.com" in img_url or "google.com" in img_url or "favicon" in img_url:
                            continue
                        if img_url not in found_urls:
                            found_urls.add(img_url)
                            results.append({
                                "thumbnail_url": img_url,
                                "source_url": img_url,
                                "title": query,
                                "width": 800,
                                "height": 600,
                                "source_site": "google",
                            })
                except Exception:
                    continue

            # Strategy 2: Fallback to scraping img tags if script regex produced no candidates
            if not results:
                soup = BeautifulSoup(html, "html.parser")
                imgs = soup.find_all("img")
                for img in imgs:
                    src = img.get("src") or img.get("data-src")
                    if src and src.startswith("http") and "gstatic.com" not in src:
                        results.append({
                            "thumbnail_url": src,
                            "source_url": src,
                            "title": img.get("alt") or query,
                            "width": 600,
                            "height": 400,
                            "source_site": "google",
                        })

            if results:
                latency = time.time() - start_time
                source_circuit_breaker.record_success(source_name, count=len(results), latency=latency)
                return results[:35]
            else:
                source_circuit_breaker.record_failure(source_name, error="No image matches extracted")
                return []

    except Exception as e:
        logger.error(f"[GoogleScraper] Error scraping Google Images for '{query}': {e}")
        source_circuit_breaker.record_failure(source_name, error=str(e))
        return []
