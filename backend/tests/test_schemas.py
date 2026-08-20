from decimal import Decimal
import pytest
from pydantic import ValidationError
from app.models.category import Category
from app.models.place import Place
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.category import CategoryRead
from app.schemas.common import PaginatedResponse, PaginationMeta, ResponseModel
from app.schemas.place import NearbySearchParams, PlaceCreate, PlaceRead
from app.schemas.review import ReviewCreate
from app.schemas.user import UserRead


def test_response_envelope_formatting():
    """Verify generic ResponseModel and PaginatedResponse envelope structure."""
    resp = ResponseModel[str](success=True, message="Success", data="Test Data")
    assert resp.success is True
    assert resp.message == "Success"
    assert resp.data == "Test Data"

    meta = PaginationMeta(page=1, page_size=10, total_items=25, total_pages=3)
    paginated = PaginatedResponse[str](success=True, message="OK", data=["a", "b"], pagination=meta)
    assert paginated.pagination.total_pages == 3
    assert len(paginated.data) == 2


def test_register_request_validation():
    """Verify user registration request validations."""
    valid = RegisterRequest(
        email="testuser@example.com",
        password="SecurePassword123!",
        full_name="Test User"
    )
    assert valid.email == "testuser@example.com"

    # Short password validation failure
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="testuser@example.com",
            password="short",
            full_name="Test User"
        )


def test_coordinate_range_validations():
    """Verify latitude and longitude range constraints."""
    nearby = NearbySearchParams(latitude=28.6139, longitude=77.2090, radius_km=15.0)
    assert nearby.radius_km == 15.0

    # Latitude out of bounds (> 90)
    with pytest.raises(ValidationError):
        NearbySearchParams(latitude=95.0, longitude=77.2090)

    # Longitude out of bounds (< -180)
    with pytest.raises(ValidationError):
        NearbySearchParams(latitude=28.6139, longitude=-190.0)


def test_review_rating_validation():
    """Verify review rating range constraint (1-5)."""
    review = ReviewCreate(rating=5, comment="Amazing place!")
    assert review.rating == 5

    with pytest.raises(ValidationError):
        ReviewCreate(rating=6, comment="Invalid rating score")

    with pytest.raises(ValidationError):
        ReviewCreate(rating=0, comment="Invalid rating score")


def test_orm_from_attributes_serialization():
    """Verify Pydantic v2 from_attributes ORM serialization."""
    user_orm = User(
        uuid="88888888-4444-4444-4444-123456789012",
        full_name="John Doe",
        email="john@example.com",
        password_hash="secret_hash",
        role="user",
        is_active=True,
        is_verified=True
    )

    user_read = UserRead.model_validate(user_orm)
    assert user_read.uuid == "88888888-4444-4444-4444-123456789012"
    assert user_read.full_name == "John Doe"
    assert user_read.email == "john@example.com"
    # Verify password_hash is not present in UserRead schema
    assert not hasattr(user_read, "password_hash")
