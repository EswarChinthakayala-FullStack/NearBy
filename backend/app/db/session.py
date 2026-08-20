from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker
from app.core.config import settings
from app.core.logging_config import logger

# Production Async Engine (MySQL 8 via asyncmy driver)
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URI,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600
)

# Async session factory
AsyncSessionFactory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Production Sync Engine (MySQL 8 via PyMySQL driver for Alembic and CLI scripts)
sync_engine = create_engine(
    settings.SYNC_DATABASE_URI,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600
)

# Sync session factory
SyncSessionFactory = sessionmaker(
    bind=sync_engine,
    class_=Session,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency managing asynchronous transactional database session lifecycle."""
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session transaction rolled back due to error: {str(e)}")
            raise
        finally:
            await session.close()


def get_sync_db() -> Session:
    """Helper returning a synchronous database session for CLI scripts."""
    return SyncSessionFactory()
