from typing import Optional
import asyncio
from app.core.celery_app import celery_app
from app.core.logging_config import logger
from app.db.session import AsyncSessionFactory
from app.services.wikipedia_service import wikipedia_service


@celery_app.task(name="enrichment.sync_wikipedia", bind=True, max_retries=3, default_retry_delay=30)
def sync_wikipedia_enrichment_task(self, place_id: Optional[int] = None) -> dict:
    """Celery background task enriching place description and history from Wikipedia."""
    logger.info(f"Executing background task 'enrichment.sync_wikipedia' for place_id: {place_id}")

    async def _run():
        async with AsyncSessionFactory() as db:
            if place_id is not None:
                return await wikipedia_service.enrich_place_content(db, place_id=place_id)
            else:
                return await wikipedia_service.enrich_all_places_content(db)

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_run())
        loop.close()
        return result
    except Exception as exc:
        logger.error(f"Task 'enrichment.sync_wikipedia' failed: {str(exc)}")
        raise self.retry(exc=exc)


# Task Alias
sync_wikipedia_content_task = sync_wikipedia_enrichment_task

__all__ = ["sync_wikipedia_enrichment_task", "sync_wikipedia_content_task"]
