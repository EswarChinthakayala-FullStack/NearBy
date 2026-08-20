from app.tasks.beat_schedule import BEAT_SCHEDULE
from app.tasks.image_tasks import scrape_place_images_task
from app.tasks.maintenance_tasks import (
    cleanup_routing_cache_task,
    osm_sync_health_check_task,
    recalculate_all_place_favorites_task,
    recalculate_all_place_ratings_task,
)
from app.tasks.osm_tasks import import_osm_region_task
from app.tasks.wikipedia_tasks import sync_wikipedia_enrichment_task


def test_celery_task_names_registered():
    """Verify background task names match Celery task registry definitions."""
    assert import_osm_region_task.name == "osm.import_region"
    assert sync_wikipedia_enrichment_task.name == "enrichment.sync_wikipedia"
    assert scrape_place_images_task.name == "enrichment.scrape_images"
    assert cleanup_routing_cache_task.name == "maintenance.cleanup_routing_cache"


def test_beat_schedule_configuration():
    """Verify Celery Beat scheduled jobs dictionary."""
    assert "cleanup-expired-routing-cache-daily" in BEAT_SCHEDULE
    assert "recalculate-ratings-nightly" in BEAT_SCHEDULE
    assert "recalculate-favorites-nightly" in BEAT_SCHEDULE
    assert "osm-periodic-sync-check-weekly" in BEAT_SCHEDULE


def test_health_check_maintenance_task():
    """Verify OSM health check task execution returns healthy dictionary."""
    res = osm_sync_health_check_task()
    assert res == {"status": "healthy"}
