import uuid
from typing import Any, Dict


class ReviewFactory:
    """Mock review entity data factory for test suites."""

    @staticmethod
    def create_data(
        rating: int = 5,
        comment: str = "Amazing place!",
        user_id: int = 1,
        place_id: int = 1
    ) -> Dict[str, Any]:
        return {
            "uuid": str(uuid.uuid4()),
            "user_id": user_id,
            "place_id": place_id,
            "rating": rating,
            "comment": comment,
            "status": "approved"
        }
