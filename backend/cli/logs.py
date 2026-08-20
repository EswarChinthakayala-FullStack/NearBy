import os
import typer
from rich.console import Console

console = Console()


def logs_command(
    lines: int = typer.Option(50, "-n", "--lines", help="Number of log lines to tail"),
):
    """Tail runtime application log file logs/app.log."""
    log_file = os.path.join("logs", "app.log")

    if not os.path.exists(log_file):
        console.print(f"[yellow]Log file '{log_file}' does not exist yet. Run application to generate logs.[/yellow]")
        return

    console.print(f"[bold cyan]Tailing last {lines} lines of '{log_file}':[/bold cyan]\n")
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            all_lines = f.readlines()
            tail_lines = all_lines[-lines:]
            for line in tail_lines:
                console.print(line.rstrip())
    except Exception as e:
        console.print(f"[red]Error reading log file: {str(e)}[/red]")
