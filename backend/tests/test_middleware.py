import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_correlation_id_and_timing_headers(client: AsyncClient):
    """Verify that X-Correlation-ID and X-Process-Time-MS headers are present in response."""
    response = await client.get("/")
    assert response.status_code == 200

    assert "X-Correlation-ID" in response.headers
    assert len(response.headers["X-Correlation-ID"]) > 0

    assert "X-Process-Time-MS" in response.headers
    assert float(response.headers["X-Process-Time-MS"]) >= 0.0


@pytest.mark.asyncio
async def test_custom_correlation_id_propagation(client: AsyncClient):
    """Verify that custom X-Correlation-ID header provided by client is preserved."""
    custom_id = "test-custom-correlation-12345"
    response = await client.get("/", headers={"X-Correlation-ID": custom_id})
    assert response.status_code == 200
    assert response.headers["X-Correlation-ID"] == custom_id
