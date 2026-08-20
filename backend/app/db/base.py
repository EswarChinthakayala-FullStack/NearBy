from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# Explicit MetaData constraint naming conventions for deterministic Alembic autogeneration
NAMING_CONVENTION = {
    "ix": "idx_%(column_0_label)s",
    "uq": "uk_%(table_name)s_%(column_0_name)s",
    "ck": "chk_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=NAMING_CONVENTION)


class Base(DeclarativeBase):
    """Centralized Declarative Base class with explicit naming convention metadata."""
    metadata = metadata


def import_all_models() -> None:
    """Import all ORM models for complete Alembic autogeneration discovery."""
    import app.models  # noqa: F401


__all__ = ["Base", "metadata", "import_all_models"]
