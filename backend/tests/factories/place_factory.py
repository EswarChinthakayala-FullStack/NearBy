import uuid
from typing import Any, Dict


class PlaceFactory:
    """Mock tourist place entity data factory for test suites."""

    @staticmethod
    def create_data(
        name: str = "Taj Mahal",
        city: str = "Agra",
        latitude: float = 27.1751,
        longitude: float = 78.0421,
        category_id: int = 1
    ) -> Dict[str, Any]:
        slug = name.lower().replace(" ", "-")
        return {
            "uuid": str(uuid.uuid4()),
            "name": name,
            "slug": slug,
            "category_id": category_id,
            "description": f"Beautiful historic monument in {city}",
            "city": city,
            "country": "India",
            "latitude": latitude,
            "longitude": longitude,
            "status": "published",
            "avg_rating": 4.80,
            "total_reviews": 10,
            "total_favorites": 5,
            "source": "admin"
        }
