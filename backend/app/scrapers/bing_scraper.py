import json
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
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
]


async def scrape_bing_images(query: str, page_num: int = 1) -> List[Dict[str, Any]]:
    """
    Scrape image search results from Bing Images using Playwright, with HTTPX fallback.
    Extracts metadata from `a.iusc` elements containing JSON in the `m` attribute.
    """
    source_name = "bing"
    if not query or not query.strip():
        return []

    if not source_circuit_breaker.is_available(source_name):
        logger.warning(f"[BingScraper] Source '{source_name}' is currently unavailable (circuit breaker open).")
        return []

    start_time = time.time()
    first_index = (page_num - 1) * 35 + 1
    url = f"https://www.bing.com/images/search?q={quote(query)}&first={first_index}"
    user_agent = random.choice(USER_AGENTS)

    results: List[Dict[str, Any]] = []

    # Attempt 1: Playwright browser scraper
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={"width": 1280, "height": 900},
                user_agent=user_agent,
            )
            page = await context.new_page()

            # Abort heavy unneeded assets for speed
            await page.route(
                "**/*",
                lambda r: r.abort() if r.request.resource_type in ["font", "media", "stylesheet"] else r.continue_()
            )

            await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_selector("a.iusc", timeout=8000)
            raw_metadata = await page.eval_on_selector_all(
                "a.iusc",
                "els => els.map(el => el.getAttribute('m'))"
            )
            await browser.close()

            for item in raw_metadata:
                if not item:
                    continue
                try:
                    data = json.loads(item)
                    murl = data.get("murl")
                    if not murl:
                        continue
                    results.append({
                        "thumbnail_url": data.get("turl") or murl,
                        "source_url": murl,
                        "title": data.get("t") or query,
                        "width": data.get("w", 0),
                        "height": data.get("h", 0),
                        "source_site": "bing",
                    })
                except json.JSONDecodeError:
                    continue

            if results:
                latency = time.time() - start_time
                source_circuit_breaker.record_success(source_name, count=len(results), latency=latency)
                return results

    except Exception as pw_err:
        logger.warning(f"[BingScraper] Playwright execution failed/unavailable ({pw_err}). Falling back to HTTPX parser.")

    # Attempt 2: HTTPX fallback parser
    try:
        headers = {
            "User-Agent": user_agent,
            "Accept-Language": "en-US,en;q=0.9",
        }
        async with httpx.AsyncClient(timeout=10.0, headers=headers, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                img_elements = soup.find_all("a", class_="iusc")
                for el in img_elements:
                    m_attr = el.get("m")
                    if not m_attr:
                        continue
                    try:
                        data = json.loads(m_attr)
                        murl = data.get("murl")
                        if not murl:
                            continue
                        results.append({
                            "thumbnail_url": data.get("turl") or murl,
                            "source_url": murl,
                            "title": data.get("t") or query,
                            "width": data.get("w", 0),
                            "height": data.get("h", 0),
                            "source_site": "bing",
                        })
                    except json.JSONDecodeError:
                        continue

        if results:
            latency = time.time() - start_time
            source_circuit_breaker.record_success(source_name, count=len(results), latency=latency)
            return results
        else:
            source_circuit_breaker.record_failure(source_name, error="No results parsed from Bing")
            return []

    except Exception as httpx_err:
        logger.error(f"[BingScraper] Error scraping Bing Images for '{query}': {httpx_err}")
        source_circuit_breaker.record_failure(source_name, error=str(httpx_err))
        return []
