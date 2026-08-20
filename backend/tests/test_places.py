"""Places API test suite."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_search_places_endpoint(client: AsyncClient):
    """Test searching places endpoint."""
    response = await client.get("/api/v1/places")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
