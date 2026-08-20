import uuid
from typing import Any, Dict


class CategoryFactory:
    """Mock category entity data factory for test suites."""

    @staticmethod
    def create_data(
        name: str = "Historical",
        slug: str = "historical",
        icon: str = "landmark"
    ) -> Dict[str, Any]:
        return {
            "uuid": str(uuid.uuid4()),
            "name": name,
            "slug": slug,
            "icon": icon,
            "description": f"Category for {name} places"
        }
