import pytest
from app.services.external import (
    BaseExternalClient,
    BingImageClient,
    OverpassClient,
    RoutingClient,
    WikipediaClient,
    WikimediaClient
)


@pytest.mark.asyncio
async def test_base_external_client_initialization():
    """Verify base external client parameter initialization."""
    client = BaseExternalClient(base_url="https://api.example.com", service_name="TestService")
    assert client.base_url == "https://api.example.com"
    assert client.service_name == "TestService"
    assert "User-Agent" in client.headers


def test_external_clients_instantiation():
    """Verify all isolated external client classes instantiate cleanly."""
    overpass = OverpassClient()
    assert overpass.service_name == "OpenStreetMap Overpass"

    wikipedia = WikipediaClient()
    assert wikipedia.service_name == "Wikipedia REST API"

    wikimedia = WikimediaClient()
    assert wikimedia.service_name == "Wikimedia Commons API"

    routing = RoutingClient()
    assert routing.service_name == "OSRM Routing Engine"

    bing = BingImageClient()
    assert bing.service_name == "Bing Image Scraper"
