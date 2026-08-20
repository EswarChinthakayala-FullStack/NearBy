"""Nearby search API test suite."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_nearby_places_endpoint(client: AsyncClient):
    """Test spatial nearby places endpoint."""
    response = await client.get("/api/v1/places/nearby?latitude=28.6139&longitude=77.2090")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
