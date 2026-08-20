"""Isolated third-party external service integration clients."""
from app.services.external.base import BaseExternalClient
from app.services.external.osm import OverpassClient
from app.services.external.wikipedia import WikipediaClient
from app.services.external.wikimedia import WikimediaClient
from app.services.external.routing import RoutingClient
from app.services.external.bing_image import BingImageClient

__all__ = [
    "BaseExternalClient",
    "OverpassClient",
    "WikipediaClient",
    "WikimediaClient",
    "RoutingClient",
    "BingImageClient",
]
