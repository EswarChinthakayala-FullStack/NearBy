import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi import status
from httpx import AsyncClient
from app.main import app
from app.api.deps import get_current_user
from app.models.user import User
from app.models.itinerary import SavedItinerary

mock_user = MagicMock(spec=User, id=1, uuid="test-user-123")

mock_saved_item = SavedItinerary(
    id=1,
    uuid="mysore-itinerary-123",
    user_id=1,
    destination="Mysore",
    title="3-Day Mysore Tour",
    travel_dates="3 Days",
    budget="Moderate",
    itinerary_data=[],
    reasoning_data={"summary": "Test summary", "travel_tips": []},
    route_data={"weather_summary": {}}
)

@pytest.mark.asyncio
async def test_generate_and_manage_itinerary(client: AsyncClient):
    app.dependency_overrides[get_current_user] = lambda: mock_user

    with patch("app.api.v1.endpoints.itinerary.itinerary_storage_service.get_by_identifier", AsyncMock(return_value=mock_saved_item)), \
         patch("app.api.v1.endpoints.itinerary.itinerary_storage_service.delete_itinerary", AsyncMock(return_value=True)), \
         patch("app.api.v1.endpoints.itinerary.itinerary_storage_service.update_itinerary", AsyncMock(return_value=mock_saved_item)), \
         patch("app.api.v1.endpoints.itinerary.itinerary_storage_service.duplicate_itinerary", AsyncMock(return_value=mock_saved_item)):

        # 1. Test POST /api/v1/itinerary/generate
        payload = {
            "query": "Plan a 3-day trip to Mysore",
            "destination": "Mysore",
            "days": 3
        }
        response = await client.post("/api/v1/itinerary/generate", json=payload)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        itinerary = data["data"]
        assert itinerary["destination"] == "Mysore"

        # 2. Test GET /api/v1/itinerary (User itineraries list)
        list_res = await client.get("/api/v1/itinerary")
        assert list_res.status_code == status.HTTP_200_OK

        # 3. Test GET /api/v1/itinerary/{itinerary_id}
        detail_res = await client.get("/api/v1/itinerary/mysore-itinerary-123")
        assert detail_res.status_code == status.HTTP_200_OK

        # 4. Test PATCH /api/v1/itinerary/{itinerary_id}
        update_res = await client.patch(
            "/api/v1/itinerary/mysore-itinerary-123",
            json={"title": "Mysore Royal Heritage Tour"}
        )
        assert update_res.status_code == status.HTTP_200_OK

        # 5. Test POST /api/v1/itinerary/{itinerary_id}/duplicate
        dup_res = await client.post("/api/v1/itinerary/mysore-itinerary-123/duplicate")
        assert dup_res.status_code == status.HTTP_200_OK

        # 6. Test DELETE /api/v1/itinerary/{itinerary_id}
        del_res = await client.delete("/api/v1/itinerary/mysore-itinerary-123")
        assert del_res.status_code == status.HTTP_200_OK

    app.dependency_overrides.pop(get_current_user, None)
