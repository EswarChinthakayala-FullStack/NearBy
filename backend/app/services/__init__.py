from app.services.geo_service import GeoService, geo_service
from app.services.image_scraper_service import ImageScraperService, image_scraper_service
from app.services.osm_service import OSMService, osm_service
from app.services.routing_service import RoutingService, routing_service
from app.services.storage_service import StorageService, storage_service
from app.services.wikipedia_service import WikipediaService, wikipedia_service

__all__ = [
    "GeoService",
    "geo_service",
    "OSMService",
    "osm_service",
    "WikipediaService",
    "wikipedia_service",
    "ImageScraperService",
    "image_scraper_service",
    "RoutingService",
    "routing_service",
    "StorageService",
    "storage_service",
]
