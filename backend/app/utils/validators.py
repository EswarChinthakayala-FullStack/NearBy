import re
import uuid
from typing import Optional


def validate_coordinates(latitude: float, longitude: float) -> bool:
    """Validate latitude (-90 to 90) and longitude (-180 to 180)."""
    return -90.0 <= latitude <= 90.0 and -180.0 <= longitude <= 180.0


def validate_rating(rating: float) -> bool:
    """Validate star rating score range (0.0 to 5.0)."""
    return 0.0 <= rating <= 5.0


def validate_email(email: str) -> bool:
    """Validate RFC-compliant email address structure."""
    if not email or not isinstance(email, str):
        return False
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email.strip()))


def validate_phone(phone: str) -> bool:
    """Validate phone number string format."""
    if not phone or not isinstance(phone, str):
        return False
    pattern = r"^\+?[1-9]\d{1,14}$"
    return bool(re.match(pattern, phone.strip().replace(" ", "").replace("-", "")))


def validate_uuid(uuid_str: str) -> bool:
    """Validate string is valid UUID v4 format."""
    if not uuid_str or not isinstance(uuid_str, str):
        return False
    try:
        uuid_obj = uuid.UUID(uuid_str.strip())
        return str(uuid_obj) == uuid_str.strip().lower()
    except ValueError:
        return False


def validate_url(url: str) -> bool:
    """Validate HTTP/HTTPS URL string structure."""
    if not url or not isinstance(url, str):
        return False
    pattern = r"^https?://[^\s/$.?#].[^\s]*$"
    return bool(re.match(pattern, url.strip()))
