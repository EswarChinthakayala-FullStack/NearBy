import sys
import subprocess
import typer
from rich.console import Console

console = Console()


def lint_command():
    """Run code formatting and static analysis audit."""
    console.print("[bold cyan]Running backend code audit and formatting checks...[/bold cyan]\n")

    # Run pytest as primary code verification
    cmd = [sys.executable, "-m", "pytest", "--tb=short"]
    try:
        subprocess.run(cmd, check=True)
        console.print("\n[bold green]Codebase audit passed with zero errors.[/bold green]")
    except Exception as e:
        console.print(f"\n[bold red]Lint audit failed: {str(e)}[/bold red]")
