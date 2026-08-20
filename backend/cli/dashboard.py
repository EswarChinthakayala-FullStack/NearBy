from rich.panel import Panel
from rich.table import Table
from rich.text import Text


def create_dashboard_panel(
    env: str,
    host: str,
    port: int,
    api_status: str = "Running",
    celery_status: str = "Running",
    redis_status: str = "Connected",
    db_status: str = "Connected",
    docs_url: str = ""
) -> Panel:
    """Construct live status dashboard Panel."""
    table = Table.grid(expand=True, padding=(0, 2))
    table.add_column("Property", style="bold white", width=16)
    table.add_column("Value", style="bold")

    table.add_row("Environment", f"[cyan]{env}[/cyan]")
    table.add_row("API Server", f"[green]{api_status}[/green]" if api_status == "Running" else f"[red]{api_status}[/red]")
    table.add_row("Celery Worker", f"[green]{celery_status}[/green]" if celery_status == "Running" else f"[yellow]{celery_status}[/yellow]")
    table.add_row("Redis Cache", f"[green]{redis_status}[/green]" if redis_status == "Connected" else f"[red]{redis_status}[/red]")
    table.add_row("MySQL Database", f"[green]{db_status}[/green]" if db_status == "Connected" else f"[red]{db_status}[/red]")
    table.add_row("Host / Port", f"[bold yellow]{host}:{port}[/bold yellow]")

    if docs_url:
        table.add_row("Swagger Docs", f"[underline blue]{docs_url}[/underline blue]")

    panel = Panel(
        table,
        title="[bold green]🚀 Local Tourism Guide Backend Live Status[/bold green]",
        subtitle="[dim]Press Ctrl+C to stop services[/dim]",
        border_style="green",
        padding=(1, 2)
    )
    return panel
