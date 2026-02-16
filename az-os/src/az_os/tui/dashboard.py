"""Textual dashboard for AZ-OS (60 FPS TUI)."""
from typing import Optional
from dataclasses import dataclass


@dataclass
class DashboardConfig:
    """Configuration for dashboard."""
    update_rate: int = 16  # ~60 FPS


class Dashboard:
    """AZ-OS Textual Dashboard."""

    def __init__(self, db=None, config=None):
        """Initialize dashboard."""
        self.db = db
        self.config = config or DashboardConfig()

    async def run(self):
        """Run the dashboard (requires textual to be installed)."""
        try:
            from textual.app import ComposeResult, RenderableType
            from textual.containers import Container, Horizontal, Vertical
            from textual.widgets import Header, Footer, Static, DataTable
            from textual.binding import Binding
            from rich.table import Table
            from rich.text import Text

            class TasksTable(Static):
                """Tasks table widget."""

                def render(self) -> RenderableType:
                    table = Table(title="AZ-OS Tasks")
                    table.add_column("ID", style="cyan")
                    table.add_column("Command", style="magenta")
                    table.add_column("Status", style="green")
                    table.add_column("Cost", style="yellow")
                    return table

            class AzOSApp:
                """AZ-OS Dashboard application."""

                def __init__(self):
                    self.db = db

                def run(self):
                    """Start the app."""
                    print("AZ-OS Dashboard (Textual)")
                    print("  q: quit")
                    print("  r: refresh")
                    print("  e: execute new task")
                    # Placeholder: actual Textual app would go here

            app = AzOSApp()
            app.run()

        except ImportError:
            print("Textual not installed. Install with: pip install textual")

    def show_tasks(self):
        """Display task list."""
        if not self.db:
            print("No database connected")
            return

        print("Tasks:")
        print("-" * 80)

    def show_metrics(self):
        """Display metrics and costs."""
        if not self.db:
            print("No database connected")
            return

        print("Metrics:")
        print("-" * 80)

    def show_logs(self, task_id: Optional[str] = None):
        """Display logs for a task or all tasks."""
        if not self.db:
            print("No database connected")
            return

        print(f"Logs for task {task_id or 'all'}:")
        print("-" * 80)
