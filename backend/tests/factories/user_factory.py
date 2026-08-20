import uuid
from typing import Any, Dict


class UserFactory:
    """Mock user entity data factory for test suites."""

    @staticmethod
    def create_data(
        full_name: str = "Test User",
        email: str = "user@example.com",
        role: str = "user",
        is_active: bool = True
    ) -> Dict[str, Any]:
        user_uuid = str(uuid.uuid4())
        return {
            "uuid": user_uuid,
            "full_name": full_name,
            "email": email,
            "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO5E/8uP5Z7W8/7Z7Z7Z7Z7Z7Z7Z7Z7Z",
            "phone": "+919876543210",
            "role": role,
            "avatar_url": None,
            "is_active": is_active,
            "is_verified": True
        }
