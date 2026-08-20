import sys
import subprocess
import typer
from rich.console import Console

console = Console()


def import_osm_command(
    region: str = typer.Option("Delhi", "--region", "-r", help="Target city or region name"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Dry run without DB writes")
):
    """Import tourist places from OpenStreetMap Overpass API."""
    cmd = [sys.executable, "scripts/import_osm_places.py", "--region", region]
    if dry_run:
        cmd.append("--dry-run")

    try:
        subprocess.run(cmd, check=True)
    except Exception as e:
        console.print(f"[red]OSM import script failed: {str(e)}[/red]")


def seed_command():
    """Seed default tourist place categories into database."""
    cmd = [sys.executable, "scripts/seed_categories.py"]
    try:
        subprocess.run(cmd, check=True)
    except Exception as e:
        console.print(f"[red]Category seeder script failed: {str(e)}[/red]")
