import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_sync_unauthorized(client: AsyncClient):
    """Verify non-admin request to admin sync endpoints returns 401/403."""
    response = await client.post("/api/v1/admin/sync/osm")
    assert response.status_code in (401, 403)
