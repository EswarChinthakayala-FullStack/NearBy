import os
import signal
import subprocess
import sys
import time
from typing import Dict, List, Optional
from rich.console import Console

console = Console()


class ProcessManager:
    """Supervises development subprocesses (API, Celery worker, Celery beat)."""

    def __init__(self):
        self.processes: Dict[str, subprocess.Popen] = {}
        self.max_restarts = 5
        self.restart_counts: Dict[str, int] = {}

    def start_process(self, name: str, command: List[str], cwd: Optional[str] = None) -> subprocess.Popen:
        """Start a managed subprocess."""
        console.print(f"[cyan]Starting {name}...[/cyan]")
        proc = subprocess.Popen(
            command,
            cwd=cwd or os.getcwd(),
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        self.processes[name] = proc
        self.restart_counts[name] = 0
        return proc

    def stop_all(self) -> None:
        """Stop all managed subprocesses cleanly."""
        console.print("\n[yellow]Stopping background processes...[/yellow]")
        for name, proc in self.processes.items():
            if proc.poll() is None:
                try:
                    if sys.platform == "win32":
                        proc.terminate()
                    else:
                        proc.send_signal(signal.SIGINT)
                    proc.wait(timeout=3)
                except Exception:
                    proc.kill()
        console.print("[green]All processes stopped successfully.[/green]")

    def check_and_restart(self) -> None:
        """Check for crashed subprocesses and attempt supervised restart."""
        for name, proc in list(self.processes.items()):
            exit_code = proc.poll()
            if exit_code is not None and exit_code != 0:
                restarts = self.restart_counts.get(name, 0)
                if restarts < self.max_restarts:
                    console.print(f"[bold red]{name} exited unexpectedly (code {exit_code}). Restarting ({restarts + 1}/{self.max_restarts})...[/bold red]")
                    self.restart_counts[name] = restarts + 1
                    # Restart process
                    command = proc.args
                    new_proc = subprocess.Popen(command, stdout=sys.stdout, stderr=sys.stderr)
                    self.processes[name] = new_proc
                else:
                    console.print(f"[bold red]{name} exceeded maximum restart limit of {self.max_restarts}. Stopping.[/bold red]")
