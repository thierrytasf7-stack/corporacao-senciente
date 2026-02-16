import asyncio
import csv
import json
from datetime import datetime
from typing import List, Dict, Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from ..core.cost_tracker import CostTracker


async def metrics_show() -> None:
    """Show cost metrics and statistics"""
    console = Console()
    tracker = CostTracker()
    
    # Get daily costs for last 7 days
    daily_costs = await tracker.get_daily_cost(7)
    
    if daily_costs:
        # Display daily costs table
        table = Table(title="Daily Costs (Last 7 Days)", show_header=True, header_style="bold cyan")
        table.add_column("Date", style="bright_white", width=12)
        table.add_column("Total Cost ($)", style="bright_green", width=14)
        table.add_column("Requests", style="bright_yellow", width=10)
        table.add_column("Avg Latency (ms)", style="bright_blue", width=16)
        
        for day in daily_costs:
            table.add_row(
                day["date"],
                f"${day['total_cost']:.4f}",
                str(day["request_count"]),
                f"{day['avg_latency']:.1f}",
            )
        
        console.print(table)
        console.print()  # Add spacing
    
    # Get total cost
    async with tracker.db_path as db:
        cursor = await db.execute("SELECT SUM(cost_usd) FROM metrics")
        total_cost = await cursor.fetchone()
        
        if total_cost and total_cost[0]:
            total_cost_value = total_cost[0]
            console.print(f"[bold cyan]Total Project Cost:[/bold cyan] $[bright_green]{total_cost_value:.4f}[/bright_green]")
            
            # Show cost by model
            cursor = await db.execute(
                """
                SELECT model, SUM(cost_usd) as total_cost, COUNT(*) as request_count
                FROM metrics 
                GROUP BY model
                ORDER BY total_cost DESC
                """
            )
            model_costs = await cursor.fetchall()
            
            if model_costs:
                console.print(f"\n[bold cyan]Cost by Model:[/bold cyan]")
                for model, cost, count in model_costs:
                    console.print(f"  [bright_white]{model}[/bright_white]: $[bright_green]{cost:.4f}[/bright_green] ({count} requests)")
        else:
            console.print("[bold yellow]No cost data available[/bold yellow]")


async def metrics_export() -> None:
    """Export all metrics to CSV file"""
    import csv
    
    output_path = "az_metrics_export.csv"
    tracker = CostTracker()
    
    async with tracker.db_path as db:
        cursor = await db.execute("SELECT * FROM metrics ORDER BY timestamp DESC")
        rows = await cursor.fetchall()
        
        if not rows:
            print("No metrics data available to export")
            return
        
        # Write to CSV
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            # Write header
            writer.writerow([desc[0] for desc in cursor.description])
            # Write data
            writer.writerows(rows)
    
    print(f"Metrics exported successfully to {output_path}")
    print(f"Total {len(rows)} records exported")


async def metrics_task(task_id: str) -> None:
    """Show cost details for a specific task"""
    console = Console()
    tracker = CostTracker()
    
    task_cost = await tracker.get_task_cost(task_id)
    
    if not task_cost:
        console.print(f"[bold red]Task {task_id} not found[/bold red]")
        return
    
    # Display task cost summary
    panel = Panel(
        Text(f"Task ID: {task_id}\n" 
             f"Total Cost: ${task_cost['total_cost']:.4f}", 
             style="bold cyan"),
        title="Task Cost Summary",
        border_style="cyan"
    )
    console.print(panel)
    
    # Display model breakdown
    table = Table(show_header=True, header_style="bold blue")
    table.add_column("Model", style="bright_white", width=12)
    table.add_column("Total Cost ($)", style="bright_green", width=14)
    table.add_column("Total Input", style="bright_yellow", width=12)
    table.add_column("Total Output", style="bright_yellow", width=12)
    table.add_column("Requests", style="bright_blue", width=10)
    table.add_column("Avg Latency (ms)", style="bright_magenta", width=16)
    
    for model_data in task_cost["models"]:
        table.add_row(
            model_data["model"],
            f"{model_data['total_cost']:.4f}",
            str(model_data["total_input"]),
            str(model_data["total_output"]),
            str(model_data["request_count"]),
            f"{model_data['avg_latency']:.1f}",
        )
    
    console.print(table)


async def metrics_model(model: str) -> None:
    """Show cost details for a specific model"""
    console = Console()
    tracker = CostTracker()
    
    model_cost = await tracker.get_model_cost(model)
    
    if not model_cost:
        console.print(f"[bold red]Model {model} not found[/bold red]")
        return
    
    # Display model cost summary
    panel = Panel(
        Text(f"Model: {model}\n" 
             f"Total Cost: ${model_cost['total_cost']:.4f}", 
             style="bold cyan"),
        title="Model Cost Summary",
        border_style="cyan"
    )
    console.print(panel)
    
    # Display detailed statistics
    stats = Table(show_header=False)
    stats.add_row("[bold]Total Input Tokens:[/bold]", str(model_cost["total_input"]))
    stats.add_row("[bold]Total Output Tokens:[/bold]", str(model_cost["total_output"]))
    stats.add_row("[bold]Total Requests:[/bold]", str(model_cost["request_count"]))
    stats.add_row("[bold]Average Latency:[/bold]", f"{model_cost['avg_latency']:.1f} ms")
    
    console.print(stats)


async def metrics_aggregate() -> None:
    """Show aggregated cost statistics"""
    console = Console()
    tracker = CostTracker()
    
    async with tracker.db_path as db:
        # Total cost
        cursor = await db.execute("SELECT SUM(cost_usd) FROM metrics")
        total_cost = await cursor.fetchone()
        
        # Total requests
        cursor = await db.execute("SELECT COUNT(*) FROM metrics")
        total_requests = await cursor.fetchone()
        
        # Average latency
        cursor = await db.execute("SELECT AVG(latency_ms) FROM metrics")
        avg_latency = await cursor.fetchone()
        
        # Cost by model
        cursor = await db.execute(
            """
            SELECT model, SUM(cost_usd) as total_cost, COUNT(*) as request_count
            FROM metrics 
            GROUP BY model
            ORDER BY total_cost DESC
            """
        )
        model_costs = await cursor.fetchall()
        
        # Display aggregated stats
        console.print("[bold cyan]Aggregated Statistics[/bold cyan]")
        
        if total_cost and total_cost[0]:
            console.print(f"Total Cost: $[bright_green]{total_cost[0]:.4f}[/bright_green]")
            console.print(f"Total Requests: [bright_yellow]{total_requests[0]}[/bright_yellow]")
            console.print(f"Average Latency: [bright_blue]{avg_latency[0]:.1f} ms[/bright_blue]")
            console.print()
            
            # Model breakdown
            console.print("[bold blue]Cost by Model[/bold blue]")
            for model, cost, count in model_costs:
                console.print(f"  [bright_white]{model}[/bright_white]: $[bright_green]{cost:.4f}[/bright_green] ({count} requests)")
        else:
            console.print("[bold yellow]No metrics data available[/bold yellow]")


# Register CLI commands
app = typer.Typer()
app.command()(metrics_show)
app.command()(metrics_export)
app.command()(metrics_task)
app.command()(metrics_model)
app.command()(metrics_aggregate)