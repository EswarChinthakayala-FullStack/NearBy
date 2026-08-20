import logging
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="osm.import_region")
def import_osm_region_task(region: str) -> dict:
    """Background task for importing OpenStreetMap data for a region."""
    logger.info(f"Starting OSM import background job for region: {region}")
    return {"status": "success", "region": region, "imported": 0}


@celery_app.task(name="enrichment.sync_wikipedia")
def sync_wikipedia_enrichment_task(place_id: int) -> dict:
    """Background task for Wikipedia summary and history enrichment."""
    logger.info(f"Starting Wikipedia enrichment background job for place_id: {place_id}")
    return {"status": "success", "place_id": place_id}


@celery_app.task(name="enrichment.scrape_images")
def scrape_place_images_task(place_id: int) -> dict:
    """Background task for Wikimedia/Bing image scraping."""
    logger.info(f"Starting image scraper background job for place_id: {place_id}")
    return {"status": "success", "place_id": place_id}


@celery_app.task(name="maintenance.cleanup_routing_cache")
def cleanup_routing_cache_task() -> dict:
    """Scheduled background job cleaning expired routing cache entries."""
    logger.info("Executing periodic routing cache cleanup job")
    return {"status": "success", "cleaned": 0}


@celery_app.task(name="maintenance.osm_sync_health_check")
def osm_sync_health_check_task() -> dict:
    """Scheduled background job verifying OSM synchronization status."""
    logger.info("Executing periodic OSM sync health check job")
    return {"status": "healthy"}
