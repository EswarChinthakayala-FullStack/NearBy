from app.utils.pagination import build_pagination_meta, get_pagination_params
from app.utils.response_wrapper import error_response, paginated_response, success_response
from app.utils.slugify import generate_slug, generate_unique_slug
from app.utils.validators import (
    validate_coordinates,
    validate_email,
    validate_phone,
    validate_rating,
    validate_url,
    validate_uuid,
)


def test_slugify_unicode_normalization():
    """Verify slug generation with unicode accents and special chars."""
    assert generate_slug("Araku Valley") == "araku-valley"
    assert generate_slug("Śrī Venkateswara Temple") == "sri-venkateswara-temple"
    assert generate_slug("Beach @ Vizag") == "beach-vizag"


def test_generate_unique_slug():
    """Verify unique slug suffix generation when collision occurs."""
    existing_slugs = {"araku-valley", "araku-valley-2"}

    def mock_exists(slug: str) -> bool:
        return slug in existing_slugs

    unique_slug = generate_unique_slug("Araku Valley", mock_exists)
    assert unique_slug == "araku-valley-3"


def test_pagination_utilities():
    """Verify offset limit calculation and metadata builder."""
    skip, limit = get_pagination_params(page=2, page_size=20)
    assert skip == 20
    assert limit == 20

    meta = build_pagination_meta(page=2, page_size=20, total_items=45)
    assert meta.total_pages == 3
    assert meta.page == 2


def test_validation_helpers():
    """Verify coordinates, rating, email, phone, UUID, and URL validators."""
    assert validate_coordinates(28.6139, 77.2090) is True
    assert validate_coordinates(100.0, 0.0) is False

    assert validate_rating(4.5) is True
    assert validate_rating(6.0) is False

    assert validate_email("user@example.com") is True
    assert validate_email("invalid-email") is False

    assert validate_phone("+919876543210") is True
    assert validate_phone("abc123") is False

    assert validate_uuid("123e4567-e89b-12d3-a456-426614174000") is True
    assert validate_uuid("invalid-uuid") is False

    assert validate_url("https://example.com/image.jpg") is True
    assert validate_url("ftp://invalid-url") is False


def test_response_wrappers():
    """Verify success, paginated, and error response envelope constructors."""
    succ = success_response(data={"key": "val"})
    assert succ.success is True
    assert succ.data == {"key": "val"}

    pag = paginated_response(data=[1, 2], page=1, page_size=10, total_items=2)
    assert pag.success is True
    assert pag.pagination.total_items == 2

    err = error_response("Validation error", code="VAL_ERR")
    assert err["success"] is False
    assert err["error"]["code"] == "VAL_ERR"
