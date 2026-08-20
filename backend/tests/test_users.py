import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_user_profile_unauthorized(client: AsyncClient):
    """Verify unauthorized request to /api/v1/users/me returns 401."""
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401
