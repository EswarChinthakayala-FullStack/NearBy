import os
import sys
import time
import typer
from rich.console import Console
from rich.live import Live
from app.core.config import settings
from cli.dashboard import create_dashboard_panel
from cli.process_manager import ProcessManager
from cli.utils import check_socket_connection, find_available_port, open_browser, render_banner

console = Console()


def dev_command(
    internal: bool = typer.Option(True, "--internal", help="Run on localhost (127.0.0.1)"),
    external: bool = typer.Option(False, "--external", help="Run on all interfaces (0.0.0.0)"),
    port: int = typer.Option(8000, "--port", "-p", help="Target TCP port for API server"),
    beat: bool = typer.Option(False, "--beat", help="Also start Celery Beat periodic scheduler"),
    open_browser_flag: bool = typer.Option(False, "--open", "-o", help="Automatically open Swagger UI in browser"),
):
    """Start local development environment (FastAPI API + Celery Worker + Live Dashboard)."""
    render_banner()

    host = "0.0.0.0" if external else "127.0.0.1"
    actual_port = find_available_port(start_port=port, host=host)

    if actual_port != port:
        console.print(f"[yellow]Port {port} is busy. Automatically switched to available port {actual_port}.[/yellow]")

    # Check Redis connectivity
    redis_host = settings.REDIS_URL.split("//")[-1].split(":")[0].split("/")[0]
    redis_port = 6379
    redis_ok = check_socket_connection(redis_host, redis_port)

    if not redis_ok:
        console.print(f"[yellow]⚠️ Warning: Could not connect to Redis at {redis_host}:{redis_port}. Celery worker may fail if Redis is not running.[/yellow]")

    docs_url = f"http://{host if host != '0.0.0.0' else '127.0.0.1'}:{actual_port}/docs"

    pm = ProcessManager()

    try:
        # 1. Start FastAPI / Uvicorn API server
        python_exe = sys.executable
        api_cmd = [
            python_exe,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            host,
            "--port",
            str(actual_port),
            "--reload"
        ]
        pm.start_process("FastAPI API Server", api_cmd)

        # 2. Start Celery Worker
        celery_cmd = [
            python_exe,
            "-m",
            "celery",
            "-A",
            "celery_worker.celery_app",
            "worker",
            "--loglevel=INFO"
        ]
        pm.start_process("Celery Worker", celery_cmd)

        # 3. Start Celery Beat if requested
        if beat:
            beat_cmd = [
                python_exe,
                "-m",
                "celery",
                "-A",
                "celery_worker.celery_app",
                "beat",
                "--loglevel=INFO"
            ]
            pm.start_process("Celery Beat", beat_cmd)

        if open_browser_flag:
            time.sleep(1.5)
            open_browser(docs_url)

        # 4. Live Dashboard Loop
        panel = create_dashboard_panel(
            env=settings.ENVIRONMENT,
            host=host,
            port=actual_port,
            api_status="Running",
            celery_status="Running",
            redis_status="Connected" if redis_ok else "Disconnected",
            db_status="Connected",
            docs_url=docs_url
        )

        with Live(panel, refresh_per_second=2, console=console) as live:
            while True:
                time.sleep(1.0)
                pm.check_and_restart()
                live.update(create_dashboard_panel(
                    env=settings.ENVIRONMENT,
                    host=host,
                    port=actual_port,
                    api_status="Running",
                    celery_status="Running",
                    redis_status="Connected" if redis_ok else "Disconnected",
                    db_status="Connected",
                    docs_url=docs_url
                ))

    except KeyboardInterrupt:
        console.print("\n[bold yellow]Shutting down development servers...[/bold yellow]")
        pm.stop_all()
        sys.exit(0)
