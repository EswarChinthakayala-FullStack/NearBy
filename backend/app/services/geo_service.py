import math
from typing import Tuple
from app.core.exceptions import ValidationException


def validate_coordinates(latitude: float, longitude: float) -> bool:
    """Validate latitude (-90 to 90) and longitude (-180 to 180) coordinate bounds."""
    if not (-90.0 <= latitude <= 90.0):
        raise ValidationException(f"Latitude coordinate '{latitude}' out of valid range [-90, 90]")
    if not (-180.0 <= longitude <= 180.0):
        raise ValidationException(f"Longitude coordinate '{longitude}' out of valid range [-180, 180]")
    return True


def haversine_distance(
    lat1: float,
    lng1: float,
    lat2: float,
    lng2: float
) -> float:
    """Calculate geographical distance in kilometers between two points using Haversine formula."""
    validate_coordinates(lat1, lng1)
    validate_coordinates(lat2, lng2)

    # Earth radius in kilometers
    r = 6371.0

    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)

    a = (
        math.sin(d_lat / 2.0) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
        math.sin(d_lng / 2.0) ** 2
    )

    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 3)


def create_bounding_box(
    latitude: float,
    longitude: float,
    radius_km: float
) -> Tuple[float, float, float, float]:
    """Calculate bounding box min_lat, min_lng, max_lat, max_lng for radius_km."""
    validate_coordinates(latitude, longitude)
    if radius_km <= 0:
        raise ValidationException("Radius kilometers must be positive")

    # Approx 1 degree latitude ~ 111 km
    lat_delta = radius_km / 111.0
    lng_delta = radius_km / (111.0 * math.cos(math.radians(latitude)))

    min_lat = max(-90.0, latitude - lat_delta)
    max_lat = min(90.0, latitude + lat_delta)
    min_lng = max(-180.0, longitude - lng_delta)
    max_lng = min(180.0, longitude + lng_delta)

    return (
        round(min_lat, 7),
        round(min_lng, 7),
        round(max_lat, 7),
        round(max_lng, 7)
    )


class GeoService:
    """Geospatial calculations and coordinate utility service."""

    @staticmethod
    def distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        return haversine_distance(lat1, lng1, lat2, lng2)

    @staticmethod
    def bounding_box(lat: float, lng: float, radius_km: float) -> Tuple[float, float, float, float]:
        return create_bounding_box(lat, lng, radius_km)

    @staticmethod
    def validate(lat: float, lng: float) -> bool:
        return validate_coordinates(lat, lng)


geo_service = GeoService()
