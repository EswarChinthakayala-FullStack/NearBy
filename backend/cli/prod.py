import sys
import subprocess
import typer
from rich.console import Console
from cli.utils import render_banner

console = Console()


def prod_command(
    host: str = typer.Option("0.0.0.0", "--host", "-h", help="Bind host address"),
    port: int = typer.Option(8000, "--port", "-p", help="Bind port number"),
    workers: int = typer.Option(4, "--workers", "-w", help="Worker processes count")
):
    """Run production Gunicorn/Uvicorn HTTP server without auto-reload."""
    render_banner()
    console.print(f"[bold green]Starting production server on {host}:{port} with {workers} workers...[/bold green]")

    python_exe = sys.executable

    if sys.platform == "win32":
        # Gunicorn isn't natively supported on Windows; use Uvicorn with multiple workers
        cmd = [
            python_exe,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            host,
            "--port",
            str(port),
            "--workers",
            str(workers)
        ]
    else:
        cmd = [
            "gunicorn",
            "app.main:app",
            "-c",
            "gunicorn.conf.py",
            "-b",
            f"{host}:{port}",
            "-w",
            str(workers)
        ]

    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        console.print("[yellow]Production server stopped.[/yellow]")
