from decimal import Decimal
import pytest
from app.crud.crud_category import crud_category
from app.crud.crud_favorite import crud_favorite
from app.crud.crud_image import crud_image
from app.crud.crud_place import crud_place
from app.crud.crud_review import crud_review
from app.crud.crud_user import crud_user
from app.models.category import Category
from app.models.place import Place
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.place import PlaceFilterParams


def test_crud_singletons_instantiated():
    """Verify repository singletons are properly bound to ORM models."""
    assert crud_user.model == User
    assert crud_place.model == Place
    assert crud_category.model == Category


def test_filter_params_instantiation():
    """Verify PlaceFilterParams construction for repository query filtering."""
    params = PlaceFilterParams(
        category_id=1,
        city="Delhi",
        min_rating=4.0,
        page=1,
        page_size=10
    )
    assert params.category_id == 1
    assert params.city == "Delhi"
    assert params.min_rating == 4.0
