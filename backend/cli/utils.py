import socket
import webbrowser
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

console = Console()


def find_available_port(start_port: int = 8000, host: str = "127.0.0.1", max_attempts: int = 20) -> int:
    """Find the next available TCP port starting from start_port."""
    for p in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind((host, p))
                return p
            except OSError:
                continue
    return start_port


def check_socket_connection(host: str, port: int, timeout: float = 2.0) -> bool:
    """Test TCP socket connectivity to target host and port."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (OSError, ConnectionRefusedError):
        return False


def open_browser(url: str) -> None:
    """Open URL in default web browser."""
    try:
        webbrowser.open(url)
    except Exception as e:
        console.print(f"[yellow]Could not automatically open browser: {str(e)}[/yellow]")


def render_banner() -> None:
    """Render startup banner in console."""
    banner_text = Text()
    banner_text.append("🚀 Local Tourism Guide Backend CLI\n", style="bold cyan")
    banner_text.append("Enterprise System Management & Developer Tooling", style="dim white")

    panel = Panel(
        banner_text,
        expand=False,
        border_style="cyan",
        padding=(1, 4)
    )
    console.print(panel)
