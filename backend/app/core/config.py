import json
from typing import Any, List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

    # Application Configuration
    PROJECT_NAME: str = Field("Nearby Tourist Guide API", description="Public application name")
    ENVIRONMENT: str = Field("development", description="Environment mode: development, testing, staging, production")
    DEBUG: bool = Field(True, description="Debug mode flag")
    API_V1_STR: str = Field("/api/v1", description="API version 1 prefix")

    # MySQL 8 Database Configuration (matches schema.sql)
    MYSQL_SERVER: str = Field("127.0.0.1", description="MySQL server hostname or IP")
    MYSQL_PORT: int = Field(3306, ge=1, le=65535, description="MySQL server port")
    MYSQL_USER: str = Field("root", description="MySQL user account")
    MYSQL_PASSWORD: str = Field("", description="MySQL password")
    MYSQL_DB: str = Field("nearby_db", description="MySQL database name")

    # Security & JWT Configuration
    SECRET_KEY: str = Field(
        "development_secret_key_super_secure_key_for_jwt_tokens_change_in_prod",
        min_length=32,
        description="Cryptographic secret key for signing JWT tokens"
    )
    ALGORITHM: str = Field("HS256", description="JWT signing algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(60, ge=1, description="Access token expiration lifetime in minutes")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(7, ge=1, description="Refresh token expiration lifetime in days")

    # Initial Admin Bootstrap Configuration
    FIRST_ADMIN_EMAIL: str = Field("admin@nearbyapp.com", description="Initial admin email address")
    FIRST_ADMIN_PASSWORD: str = Field("Admin@Nearby2026!Secure", description="Initial admin password")
    FIRST_ADMIN_NAME: str = Field("System Administrator", description="Initial admin display name")

    # Redis & Celery Task Broker Configuration
    REDIS_URL: str = Field("redis://127.0.0.1:6379/0", description="Redis connection URL for caching")
    CELERY_BROKER_URL: str = Field("redis://127.0.0.1:6379/1", description="Celery task broker Redis URL")
    CELERY_RESULT_BACKEND: str = Field("redis://127.0.0.1:6379/2", description="Celery result backend Redis URL")

    # Media & File Storage Configuration
    MEDIA_UPLOAD_DIR: str = Field("uploads", description="Local image upload directory path")
    UPLOAD_URL_PREFIX: str = Field("/uploads", description="Public static URL prefix for uploaded images")
    MAX_UPLOAD_SIZE_BYTES: int = Field(10485760, ge=1024, description="Maximum allowed file upload size in bytes (10MB)")

    # External Third-Party Services
    OVERPASS_API_URL: str = Field("https://overpass-api.de/api/interpreter", description="OpenStreetMap Overpass API URL")
    WIKIPEDIA_API_URL: str = Field("https://en.wikipedia.org/api/rest_v1", description="Wikipedia REST API URL")
    WIKIMEDIA_COMMONS_API_URL: str = Field("https://commons.wikimedia.org/w/api.php", description="Wikimedia Commons API URL")
    OSRM_ROUTING_URL: str = Field("http://router.project-osrm.org", description="OSRM Routing Engine base URL")
    BING_IMAGE_SEARCH_URL: str = Field("https://www.bing.com/images/search", description="Bing image search URL")
    EXTERNAL_REQUEST_TIMEOUT_SECONDS: float = Field(15.0, gt=0, description="Timeout for external API HTTP requests in seconds")

    # AI Services Configuration
    MISTRAL_API_KEY: str = Field("fvlzCnWL1N96wBQ1ICx4sOq1iMHk7pwG", description="Mistral AI API Key")
    MISTRAL_MODEL: str = Field("mistral-large-latest", description="Mistral AI Model ID")

    # Pagination & Search Defaults
    DEFAULT_PAGE_SIZE: int = Field(20, ge=1, le=100, description="Default pagination size")
    MAX_PAGE_SIZE: int = Field(100, ge=1, description="Maximum allowed pagination size limit")

    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = Field(
        ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:8000"],
        description="Allowed CORS origin origins list"
    )

    # Logging Configuration
    LOG_LEVEL: str = Field("INFO", description="Global logging verbosity level")

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("["):
                return json.loads(v)
            return [i.strip() for i in v.split(",")]
        return v

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """SQLAlchemy Connection URI alias."""
        return self.ASYNC_DATABASE_URI

    @property
    def ASYNC_DATABASE_URI(self) -> str:
        """SQLAlchemy Async MySQL Connection URI using asyncmy driver."""
        password = f":{self.MYSQL_PASSWORD}" if self.MYSQL_PASSWORD else ""
        return f"mysql+asyncmy://{self.MYSQL_USER}{password}@{self.MYSQL_SERVER}:{self.MYSQL_PORT}/{self.MYSQL_DB}?charset=utf8mb4"

    @property
    def SYNC_DATABASE_URI(self) -> str:
        """SQLAlchemy Sync MySQL Connection URI using PyMySQL driver (for Alembic migrations)."""
        password = f":{self.MYSQL_PASSWORD}" if self.MYSQL_PASSWORD else ""
        return f"mysql+pymysql://{self.MYSQL_USER}{password}@{self.MYSQL_SERVER}:{self.MYSQL_PORT}/{self.MYSQL_DB}?charset=utf8mb4"


settings = Settings()
