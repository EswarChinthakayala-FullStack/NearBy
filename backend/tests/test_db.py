import pytest
from app.db.base import Base, NAMING_CONVENTION, metadata
from app.db.init_db import DEFAULT_CATEGORIES, _slugify
from app.db.session import async_engine, get_db
from app.models import (
    AdminActivityLog,
    Category,
    ContentSyncLog,
    Favorite,
    OsmSyncLog,
    Place,
    PlaceImage,
    PlaceTiming,
    RefreshToken,
    Review,
    ReviewImage,
    RoutingCache,
    User
)


def test_declarative_base_metadata_naming_convention():
    """Verify Declarative Base naming convention configuration."""
    assert metadata.naming_convention["pk"] == "pk_%(table_name)s"
    assert metadata.naming_convention["fk"] == "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s"
    assert metadata.naming_convention["uq"] == "uk_%(table_name)s_%(column_0_name)s"


def test_all_models_registered_in_base_metadata():
    """Verify all 13 domain models are registered in Base metadata for Alembic discovery."""
    tables = metadata.tables.keys()

    expected_tables = [
        "users",
        "refresh_tokens",
        "categories",
        "places",
        "place_timings",
        "place_images",
        "reviews",
        "review_images",
        "favorites",
        "osm_sync_logs",
        "content_sync_logs",
        "routing_cache",
        "admin_activity_logs"
    ]

    for table in expected_tables:
        assert table in tables, f"Table '{table}' missing from Base metadata registration"


def test_default_categories_list_and_slugify():
    """Verify default bootstrap category data and slugify helper."""
    assert len(DEFAULT_CATEGORIES) >= 8
    assert _slugify("Historical Fort") == "historical-fort"
    assert _slugify("Temple & Shrine") == "temple-shrine"


@pytest.mark.asyncio
async def test_get_db_dependency_yields_session():
    """Verify get_db dependency yields an async session."""
    db_gen = get_db()
    session = await anext(db_gen)
    assert session is not None
    await db_gen.aclose()
