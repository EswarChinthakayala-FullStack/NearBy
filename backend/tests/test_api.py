import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_health_check(client: AsyncClient):
    """Verify application root endpoint response."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "Nearby Tourist Guide API"


@pytest.mark.asyncio
async def test_categories_list_endpoint(client: AsyncClient):
    """Verify public categories listing endpoint returns standardized envelope."""
    response = await client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


@pytest.mark.asyncio
async def test_places_search_endpoint(client: AsyncClient):
    """Verify public places list search endpoint returns paginated envelope."""
    response = await client.get("/api/v1/places")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "pagination" in data
    assert data["pagination"]["page"] == 1


@pytest.mark.asyncio
async def test_nearby_places_endpoint(client: AsyncClient):
    """Verify spatial nearby search endpoint."""
    response = await client.get("/api/v1/places/nearby?latitude=28.6139&longitude=77.2090")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


@pytest.mark.asyncio
async def test_directions_endpoint(client: AsyncClient):
    """Verify directions route calculation endpoint."""
    response = await client.get("/api/v1/directions?origin_lat=28.6139&origin_lng=77.2090&dest_lat=28.6562&dest_lng=77.2410")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "distance_meters" in data["data"]
