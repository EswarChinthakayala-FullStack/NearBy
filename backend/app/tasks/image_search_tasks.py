import asyncio
from typing import List, Dict, Any
from celery import chord

from app.tasks.celery_app import celery_app
from app.core.logging_config import logger
from app.scrapers.bing_scraper import scrape_bing_images
from app.scrapers.ddg_scraper import scrape_duckduckgo_images
from app.scrapers.google_scraper import scrape_google_images
from app.scrapers.aggregator import aggregate_image_results


@celery_app.task(name="image_search.scrape_bing")
def scrape_bing_task(query: str, page: int = 1) -> List[Dict[str, Any]]:
    """Celery task for scraping Bing Images."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(scrape_bing_images(query, page_num=page))
    finally:
        loop.close()


@celery_app.task(name="image_search.scrape_ddg")
def scrape_ddg_task(query: str, page: int = 1) -> List[Dict[str, Any]]:
    """Celery task for scraping DuckDuckGo Images."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(scrape_duckduckgo_images(query, page_num=page))
    finally:
        loop.close()


@celery_app.task(name="image_search.scrape_google")
def scrape_google_task(query: str, page: int = 1) -> List[Dict[str, Any]]:
    """Celery task for scraping Google Images (bonus source)."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(scrape_google_images(query, page_num=page))
    finally:
        loop.close()


@celery_app.task(name="image_search.aggregate")
def aggregate_image_results_task(results_list: List[List[Dict[str, Any]]], query: str, page: int = 1) -> List[Dict[str, Any]]:
    """Celery chord callback task aggregating, deduplicating, and ranking results."""
    return aggregate_image_results(results_list, query=query, page=page)


def search_images_chord(query: str, page: int = 1):
    """Launch parallel Celery chord across all scraper sources."""
    job = chord(
        [
            scrape_bing_task.s(query, page),
            scrape_ddg_task.s(query, page),
            scrape_google_task.s(query, page),
        ],
        aggregate_image_results_task.s(query, page),
    )
    return job.apply_async()


async def search_images_direct_async(query: str, page: int = 1) -> List[Dict[str, Any]]:
    """
    Direct async parallel execution engine running scrapers via asyncio.gather.
    Used for instant responses or as fallback when Celery worker is offline.
    """
    bing_res, ddg_res, google_res = await asyncio.gather(
        scrape_bing_images(query, page_num=page),
        scrape_duckduckgo_images(query, page_num=page),
        scrape_google_images(query, page_num=page),
        return_exceptions=True
    )

    clean_results = []
    for r in (bing_res, ddg_res, google_res):
        if isinstance(r, list):
            clean_results.append(r)
        else:
            clean_results.append([])

    return aggregate_image_results(clean_results, query=query, page=page)
