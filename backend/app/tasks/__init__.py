from app.tasks.image_tasks import fetch_place_images_task, scrape_place_images_task
from app.tasks.maintenance_tasks import (
    cleanup_routing_cache_task,
    osm_sync_health_check_task,
    recalculate_all_place_favorites_task,
    recalculate_all_place_ratings_task,
)
from app.tasks.osm_tasks import import_osm_region_task, sync_osm_places_task
from app.tasks.wikipedia_tasks import sync_wikipedia_content_task, sync_wikipedia_enrichment_task

from app.tasks.image_search_tasks import (
    scrape_bing_task,
    scrape_ddg_task,
    scrape_google_task,
    aggregate_image_results_task,
    search_images_chord,
    search_images_direct_async,
)

__all__ = [
    "import_osm_region_task",
    "sync_osm_places_task",
    "sync_wikipedia_enrichment_task",
    "sync_wikipedia_content_task",
    "scrape_place_images_task",
    "fetch_place_images_task",
    "recalculate_all_place_ratings_task",
    "recalculate_all_place_favorites_task",
    "cleanup_routing_cache_task",
    "osm_sync_health_check_task",
    "scrape_bing_task",
    "scrape_ddg_task",
    "scrape_google_task",
    "aggregate_image_results_task",
    "search_images_chord",
    "search_images_direct_async",
]

