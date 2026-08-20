"""Favorites API test suite."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_unauthorized_favorites_list(client: AsyncClient):
    """Test getting favorites without authentication token returns 401."""
    response = await client.get("/api/v1/favorites")
    assert response.status_code == 401
