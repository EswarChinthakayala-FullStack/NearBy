"""Reviews API test suite."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_place_reviews_endpoint(client: AsyncClient):
    """Test getting place reviews endpoint."""
    response = await client.get("/api/v1/reviews/place/dummy-place-uuid")
    # Returns 404 or 200 depending on DB record existence
    assert response.status_code in [200, 404]
