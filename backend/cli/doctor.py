import os
import sys
import typer
from rich.console import Console
from rich.table import Table
from app.core.config import settings
from cli.utils import check_socket_connection, render_banner

console = Console()


def doctor_command():
    """Run comprehensive system health diagnostics check."""
    render_banner()
    console.print("[bold cyan]Running Backend Infrastructure Doctor Diagnostics...[/bold cyan]\n")

    table = Table(title="System & Infrastructure Diagnostic Checks", border_style="cyan")
    table.add_column("Component / Requirement", style="bold white")
    table.add_column("Status", style="bold")
    table.add_column("Details", style="dim white")

    # 1. Python Version
    py_ver = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    py_ok = sys.version_info >= (3, 11)
    table.add_row(
        "Python Runtime (3.11+)",
        "[green]✓ OK[/green]" if py_ok else "[red]✗ Unsupported[/red]",
        f"Python {py_ver}"
    )

    # 2. Virtual Environment
    in_venv = sys.prefix != sys.base_prefix
    table.add_row(
        "Virtual Environment (venv)",
        "[green]✓ Active[/green]" if in_venv else "[yellow]⚠️ Inactive[/yellow]",
        sys.prefix
    )

    # 3. Redis Connection
    redis_host = settings.REDIS_URL.split("//")[-1].split(":")[0].split("/")[0]
    redis_port = 6379
    redis_ok = check_socket_connection(redis_host, redis_port)
    table.add_row(
        "Redis Server (Broker & Cache)",
        "[green]✓ Connected[/green]" if redis_ok else "[red]✗ Unreachable[/red]",
        f"{redis_host}:{redis_port}"
    )

    # 4. MySQL Connection
    db_host = settings.MYSQL_SERVER
    db_port = settings.MYSQL_PORT
    db_ok = check_socket_connection(db_host, db_port)
    table.add_row(
        "MySQL Server (XAMPP / DB)",
        "[green]✓ Connected[/green]" if db_ok else "[red]✗ Unreachable[/red]",
        f"{db_host}:{db_port}"
    )

    # 5. Media Upload Directory Write Permission
    upload_dir = settings.MEDIA_UPLOAD_DIR
    try:
        os.makedirs(upload_dir, exist_ok=True)
        test_file = os.path.join(upload_dir, ".doctor_test")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        upload_ok = True
    except Exception:
        upload_ok = False

    table.add_row(
        "Uploads Directory Permissions",
        "[green]✓ Writable[/green]" if upload_ok else "[red]✗ Permission Error[/red]",
        os.path.abspath(upload_dir)
    )

    # 6. Alembic Config Check
    alembic_ok = os.path.exists("alembic.ini") and os.path.exists("alembic/env.py")
    table.add_row(
        "Alembic Migration System",
        "[green]✓ Configured[/green]" if alembic_ok else "[red]✗ Missing Files[/red]",
        "alembic.ini & alembic/env.py"
    )

    # 7. Environment Variables Check
    env_ok = bool(settings.SECRET_KEY and settings.SQLALCHEMY_DATABASE_URI)
    table.add_row(
        "Environment Configuration (.env)",
        "[green]✓ Valid[/green]" if env_ok else "[red]✗ Invalid Secrets[/red]",
        f"Environment: {settings.ENVIRONMENT}"
    )

    console.print(table)
