from rich.console import Console
from rich.table import Table
from app.core.config import settings

console = Console()


def mask_secret(value: str) -> str:
    """Mask secret string showing only first 4 chars."""
    if not value or len(value) < 4:
        return "********"
    return value[:4] + "*" * (len(value) - 4)


def config_command():
    """Inspect application settings with masked sensitive secrets."""
    console.print("[bold cyan]Application Configuration & Environment Settings[/bold cyan]\n")

    table = Table(border_style="cyan")
    table.add_column("Setting Key", style="bold white")
    table.add_column("Configured Value", style="bold yellow")

    table.add_row("PROJECT_NAME", settings.PROJECT_NAME)
    table.add_row("ENVIRONMENT", settings.ENVIRONMENT)
    table.add_row("DEBUG", str(settings.DEBUG))
    table.add_row("API_V1_STR", settings.API_V1_STR)

    # Database
    db_uri_masked = settings.SQLALCHEMY_DATABASE_URI
    if "@" in db_uri_masked:
        parts = db_uri_masked.split("@")
        db_uri_masked = parts[0].split(":")[0] + ":****@" + parts[1]
    table.add_row("MYSQL_DATABASE_URI", db_uri_masked)

    # JWT
    table.add_row("SECRET_KEY", mask_secret(settings.SECRET_KEY))
    table.add_row("ALGORITHM", settings.ALGORITHM)
    table.add_row("ACCESS_TOKEN_EXPIRE_MINUTES", str(settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    # Redis & Celery
    table.add_row("REDIS_URL", settings.REDIS_URL)

    # Storage
    table.add_row("MEDIA_UPLOAD_DIR", settings.MEDIA_UPLOAD_DIR)

    console.print(table)
