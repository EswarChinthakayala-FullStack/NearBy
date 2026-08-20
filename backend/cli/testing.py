import sys
import subprocess
import typer
from rich.console import Console

console = Console()


def test_command(
    verbose: bool = typer.Option(False, "-v", "--verbose", help="Verbose test output")
):
    """Run Pytest automated test suite."""
    console.print("[bold cyan]Running Pytest test suite...[/bold cyan]\n")
    cmd = [sys.executable, "-m", "pytest"]
    if verbose:
        cmd.append("-v")

    try:
        subprocess.run(cmd, check=True)
        console.print("\n[bold green]All tests passed successfully![/bold green]")
    except subprocess.CalledProcessError:
        console.print("\n[bold red]Test suite failed.[/bold red]")
