import asyncio
from app.core.celery_app import celery_app
from app.core.logging_config import logger
from app.db.session import AsyncSessionFactory
from app.services.osm_service import osm_service


@celery_app.task(name="osm.import_region", bind=True, max_retries=3, default_retry_delay=30)
def import_osm_region_task(self, region: str) -> dict:
    """Celery background task importing OpenStreetMap tourist places for a region."""
    logger.info(f"Executing background task 'osm.import_region' for region: {region}")

    async def _run():
        async with AsyncSessionFactory() as db:
            return await osm_service.import_places_for_region(db, region=region)

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_run())
        loop.close()
        return result
    except Exception as exc:
        logger.error(f"Task 'osm.import_region' failed for region {region}: {str(exc)}")
        raise self.retry(exc=exc)


# Task Aliases for backward compatibility
sync_osm_places_task = import_osm_region_task

__all__ = ["import_osm_region_task", "sync_osm_places_task"]
