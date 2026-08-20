import os
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler
)
from app.core.logging_config import setup_logging
from app.core.middleware import CorrelationIdMiddleware, RequestTimingMiddleware

# Setup centralized logging
setup_logging()

# Ensure upload base directory exists
os.makedirs(settings.MEDIA_UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    description="Enterprise Backend API for Local Tourism Guide & Directory System"
)

# Custom Middleware (Order: Timing -> Correlation ID -> CORS)
app.add_middleware(RequestTimingMiddleware)
app.add_middleware(CorrelationIdMiddleware)

# CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Global Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Mount Static Uploads Folder
app.mount("/uploads", StaticFiles(directory=settings.MEDIA_UPLOAD_DIR), name="uploads")

# Register V1 API Routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def on_startup():
    """Startup handler creating all ORM tables and seeding initial admin user."""
    from app.db.base import Base, import_all_models
    from app.db.session import async_engine, AsyncSessionFactory
    from app.models.user import User
    from app.core.security import get_password_hash
    from sqlalchemy import select

    import_all_models()
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed or reset initial admin credentials
    async with AsyncSessionFactory() as db:
        stmt = select(User).where(User.email == settings.FIRST_ADMIN_EMAIL.lower().strip())
        res = await db.execute(stmt)
        admin = res.scalars().first()

        hashed_pwd = get_password_hash(settings.FIRST_ADMIN_PASSWORD)

        if not admin:
            admin = User(
                full_name=settings.FIRST_ADMIN_NAME,
                email=settings.FIRST_ADMIN_EMAIL.lower().strip(),
                password_hash=hashed_pwd,
                role="admin",
                is_active=True,
                is_verified=True
            )
            db.add(admin)
        else:
            admin.password_hash = hashed_pwd
            admin.role = "admin"
            admin.is_active = True
            db.add(admin)

        await db.commit()



@app.get("/", tags=["Root"])
async def root():
    """Application root health and info check."""
    return {
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """General service health status check."""
    return {"status": "healthy", "service": settings.PROJECT_NAME}


@app.get("/health/db", tags=["Health"])
async def health_db_check():
    """Database connectivity health check."""
    from sqlalchemy import text
    from app.db.session import AsyncSessionFactory
    try:
        async with AsyncSessionFactory() as db:
            await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


@app.get("/health/redis", tags=["Health"])
async def health_redis_check():
    """Redis cache / Celery broker connectivity health check."""
    import redis.asyncio as aioredis
    try:
        r = aioredis.from_url(settings.REDIS_URL)
        await r.ping()
        await r.aclose()
        return {"status": "healthy", "redis": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "redis": str(e)}
