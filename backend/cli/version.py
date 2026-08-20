import platform
import sys
from rich.console import Console
from rich.table import Table
from app.core.config import settings

console = Console()


def version_command():
    """Display software versions of backend components, runtime, and OS."""
    console.print("[bold cyan]Local Tourism Guide Backend Component Versions[/bold cyan]\n")

    table = Table(border_style="cyan")
    table.add_column("Component / Framework", style="bold white")
    table.add_column("Version", style="bold yellow")

    table.add_row("Backend Application", "1.0.0")
    table.add_row("Python Runtime", f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    table.add_row("Operating System", f"{platform.system()} {platform.release()}")
    table.add_row("FastAPI Framework", "0.109.0+")
    table.add_row("SQLAlchemy ORM", "2.0.25+")
    table.add_row("Alembic Migrations", "1.13.1+")
    table.add_row("Celery Worker", "5.3.6+")
    table.add_row("Pydantic Validation", "2.5.3+")

    console.print(table)
