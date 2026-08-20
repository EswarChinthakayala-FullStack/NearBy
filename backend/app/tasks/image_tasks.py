from typing import Optional
import asyncio
from app.core.celery_app import celery_app
from app.core.logging_config import logger
from app.db.session import AsyncSessionFactory
from app.services.image_scraper_service import image_scraper_service


@celery_app.task(name="enrichment.scrape_images", bind=True, max_retries=3, default_retry_delay=30)
def scrape_place_images_task(self, place_id: Optional[int] = None, limit: int = 3) -> dict:
    """Celery background task orchestrating multi-provider image scraping and thumbnail storage."""
    logger.info(f"Executing background task 'enrichment.scrape_images' for place_id: {place_id}")

    async def _run():
        async with AsyncSessionFactory() as db:
            if place_id is not None:
                return await image_scraper_service.scrape_and_save_place_images(db, place_id=place_id, limit=limit)
            else:
                return await image_scraper_service.scrape_all_places_missing_images(db, limit_per_place=limit)

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_run())
        loop.close()
        return result
    except Exception as exc:
        logger.error(f"Task 'enrichment.scrape_images' failed: {str(exc)}")
        raise self.retry(exc=exc)


# Task Alias
fetch_place_images_task = scrape_place_images_task

__all__ = ["scrape_place_images_task", "fetch_place_images_task"]
