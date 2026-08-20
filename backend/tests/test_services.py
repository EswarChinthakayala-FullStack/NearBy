import pytest
from app.core.exceptions import ValidationException
from app.services.geo_service import create_bounding_box, haversine_distance, validate_coordinates
from app.services.wikipedia_service import clean_wikipedia_text


def test_haversine_distance_calculation():
    """Verify distance calculation between Delhi and Agra."""
    # Delhi (28.6139, 77.2090) to Agra (27.1767, 78.0081) ~ 170-200 km
    dist = haversine_distance(28.6139, 77.2090, 27.1767, 78.0081)
    assert 160.0 <= dist <= 210.0


def test_create_bounding_box():
    """Verify bounding box calculation around coordinates."""
    min_lat, min_lng, max_lat, max_lng = create_bounding_box(28.6139, 77.2090, 10.0)
    assert min_lat < 28.6139 < max_lat
    assert min_lng < 77.2090 < max_lng


def test_invalid_coordinates_validation():
    """Verify coordinate range validation exceptions."""
    assert validate_coordinates(45.0, 90.0) is True

    with pytest.raises(ValidationException):
        validate_coordinates(95.0, 0.0)

    with pytest.raises(ValidationException):
        validate_coordinates(0.0, 185.0)


def test_wikipedia_text_cleaner():
    """Verify cleaning HTML tags and citation references from Wikipedia text."""
    raw = "<p>The <b>Red Fort</b> is a historic fort in Delhi [1] [citation needed].</p>"
    cleaned = clean_wikipedia_text(raw)
    assert "Red Fort" in cleaned
    assert "historic fort in Delhi" in cleaned
    assert "<p>" not in cleaned
    assert "[1]" not in cleaned
    assert "[citation needed]" not in cleaned
