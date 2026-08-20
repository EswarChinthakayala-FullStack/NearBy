from decimal import Decimal
import pytest
from app.models.category import Category
from app.models.enums import ImageSource, PlaceStatus, ReviewStatus, UserRole
from app.models.favorite import Favorite
from app.models.image import PlaceImage
from app.models.place import Place
from app.models.review import Review
from app.models.timing import PlaceTiming
from app.models.user import RefreshToken, User


def test_enums_values():
    """Verify strongly-typed Enum string values."""
    assert UserRole.ADMIN.value == "admin"
    assert PlaceStatus.PUBLISHED.value == "published"
    assert ImageSource.WIKIMEDIA.value == "wikimedia"
    assert ReviewStatus.PENDING.value == "pending"


def test_user_model_instantiation():
    """Verify User ORM model instantiation."""
    user = User(
        full_name="Alice Smith",
        email="alice@example.com",
        password_hash="hashed_pw_xyz",
        role=UserRole.USER.value,
        is_active=True
    )
    assert user.full_name == "Alice Smith"
    assert user.email == "alice@example.com"
    assert user.role == "user"
    assert user.is_active is True


def test_place_model_instantiation():
    """Verify Place ORM model instantiation."""
    place = Place(
        name="Red Fort",
        slug="red-fort",
        category_id=1,
        latitude=Decimal("28.6562"),
        longitude=Decimal("77.2410"),
        status=PlaceStatus.PUBLISHED.value
    )
    assert place.name == "Red Fort"
    assert place.slug == "red-fort"
    assert place.latitude == Decimal("28.6562")
    assert place.longitude == Decimal("77.2410")
    assert place.status == "published"


def test_timing_table_constraints():
    """Verify PlaceTiming table args constraints."""
    constraints = [c.name for c in PlaceTiming.__table__.constraints]
    assert "chk_place_timings_day_range" in constraints
    assert "uk_place_timings_day" in constraints


def test_review_table_constraints():
    """Verify Review table args constraints."""
    constraints = [c.name for c in Review.__table__.constraints]
    assert "chk_reviews_rating_range" in constraints
    assert "uk_reviews_user_place" in constraints
