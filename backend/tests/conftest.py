from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient
from app.db.session import get_db
from app.main import app


async def override_get_db() -> AsyncGenerator[AsyncMock, None]:
    """Mock async database session for offline test execution."""
    session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_result.scalars.return_value.first.return_value = None
    mock_result.scalar_one.return_value = 0
    mock_result.first.return_value = MagicMock(avg_rating=0.0, total_reviews=0)
    session.execute.return_value = mock_result
    yield session


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client fixture testing FastAPI routes with database override."""
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
