import os
import shutil
from rich.console import Console

console = Console()

CLEAN_DIRS = ["__pycache__", ".pytest_cache", ".mypy_cache", ".coverage", "build", "dist"]


def clean_command():
    """Remove Python cache files, pycache directories, and temporary test artifacts."""
    console.print("[bold yellow]Cleaning Python cache files and build artifacts...[/bold yellow]")

    removed_count = 0
    for root, dirs, files in os.walk("."):
        # Don't touch venv or uploads
        if "venv" in root or "uploads" in root:
            continue

        for d in list(dirs):
            if d in CLEAN_DIRS or d.endswith(".egg-info"):
                dir_path = os.path.join(root, d)
                try:
                    shutil.rmtree(dir_path)
                    removed_count += 1
                except Exception as e:
                    console.print(f"[red]Error removing {dir_path}: {str(e)}[/red]")

    console.print(f"[bold green]Cleaned {removed_count} cache and build directories.[/bold green]")
