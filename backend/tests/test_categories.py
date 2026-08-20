import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_categories_list(client: AsyncClient):
    """Verify public categories listing endpoint."""
    response = await client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
