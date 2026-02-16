from datetime import datetime
from typing import Dict, List, Optional, Tuple
import sqlite3
from aiosqlite import connect
from pydantic import BaseModel, Field
from ..storage import get_db_path


class CostModel(BaseModel):
    name: str
    input_cost: float = Field(default=0.0, description="Cost per 1K input tokens")
    output_cost: float = Field(default=0.0, description="Cost per 1K output tokens")


class CostEntry(BaseModel):
    task_id: str
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_ms: int
    timestamp: datetime
    retry_count: int = 0


class CostTracker:
    def __init__(self):
        self.models: Dict[str, CostModel] = {
            "claude": CostModel(name="claude", input_cost=0.003, output_cost=0.015),
            "gemini": CostModel(name="gemini", input_cost=0.001, output_cost=0.002),
            "deepseek": CostModel(name="deepseek", input_cost=0.0, output_cost=0.0),
        }
        self.db_path = get_db_path()

    async def track_cost(
        self,
        task_id: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        latency_ms: int,
        retry_count: int = 0,
    ) -> None:
        """Track cost for a single API call"""
        if model not in self.models:
            raise ValueError(f"Unknown model: {model}")

        model_config = self.models[model]
        cost_usd = (input_tokens * model_config.input_cost / 1000) + \
                   (output_tokens * model_config.output_cost / 1000)

        entry = CostEntry(
            task_id=task_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
            timestamp=datetime.now(),
            retry_count=retry_count,
        )

        async with connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO metrics (
                    task_id, model, input_tokens, output_tokens, 
                    cost_usd, latency_ms, timestamp, retry_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry.task_id,
                    entry.model,
                    entry.input_tokens,
                    entry.output_tokens,
                    entry.cost_usd,
                    entry.latency_ms,
                    entry.timestamp,
                    entry.retry_count,
                ),
            )
            await db.commit()

    async def get_daily_cost(self, days: int = 7) -> List[Dict]:
        """Get cost aggregation for the last N days"""
        async with connect(self.db_path) as db:
            cursor = await db.execute(
                """
                SELECT 
                    DATE(timestamp) as date,
                    SUM(cost_usd) as total_cost,
                    COUNT(*) as request_count,
                    AVG(latency_ms) as avg_latency
                FROM metrics 
                WHERE timestamp >= datetime('now', ?)
                GROUP BY DATE(timestamp)
                ORDER BY date DESC
                LIMIT ?
                """,
                (f"-{days} days", days),
            )
            rows = await cursor.fetchall()
            return [{
                "date": row[0],
                "total_cost": row[1],
                "request_count": row[2],
                "avg_latency": row[3],
            } for row in rows]

    async def get_task_cost(self, task_id: str) -> Optional[Dict]:
        """Get cost details for a specific task"""
        async with connect(self.db_path) as db:
            cursor = await db.execute(
                """
                SELECT 
                    model, 
                    SUM(cost_usd) as total_cost,
                    SUM(input_tokens) as total_input,
                    SUM(output_tokens) as total_output,
                    COUNT(*) as request_count,
                    AVG(latency_ms) as avg_latency
                FROM metrics 
                WHERE task_id = ?
                GROUP BY model
                """,
                (task_id,),
            )
            rows = await cursor.fetchall()
            if not rows:
                return None
            return {
                "task_id": task_id,
                "models": [{
                    "model": row[0],
                    "total_cost": row[1],
                    "total_input": row[2],
                    "total_output": row[3],
                    "request_count": row[4],
                    "avg_latency": row[5],
                } for row in rows],
                "total_cost": sum(row[1] for row in rows),
            }

    async def get_model_cost(self, model: str) -> Optional[Dict]:
        """Get cost details for a specific model"""
        async with connect(self.db_path) as db:
            cursor = await db.execute(
                """
                SELECT 
                    SUM(cost_usd) as total_cost,
                    SUM(input_tokens) as total_input,
                    SUM(output_tokens) as total_output,
                    COUNT(*) as request_count,
                    AVG(latency_ms) as avg_latency
                FROM metrics 
                WHERE model = ?
                """,
                (model,),
            )
            row = await cursor.fetchone()
            if not row:
                return None
            return {
                "model": model,
                "total_cost": row[0],
                "total_input": row[1],
                "total_output": row[2],
                "request_count": row[3],
                "avg_latency": row[4],
            }


# CLI Commands
async def metrics_show() -> None:
    """Show cost metrics"""
    from az_os.cli import app
    from rich.console import Console
    from rich.table import Table
    
    console = Console()
    tracker = CostTracker()
    
    # Daily costs
    daily_costs = await tracker.get_daily_cost(7)
    if daily_costs:
        table = Table(title="Daily Costs (Last 7 Days)")
        table.add_column("Date", style="cyan")
        table.add_column("Total Cost ($)", style="green")
        table.add_column("Requests", style="yellow")
        table.add_column("Avg Latency (ms)", style="blue")
        
        for day in daily_costs:
            table.add_row(
                day["date"],
                f"{day['total_cost']:.4f}",
                str(day["request_count"]),
                f"{day['avg_latency']:.1f}",
            )
        console.print(table)
    
    # Total cost
    async with connect(tracker.db_path) as db:
        cursor = await db.execute("SELECT SUM(cost_usd) FROM metrics")
        total_cost = await cursor.fetchone()
        if total_cost and total_cost[0]:
            console.print(f"\nTotal Project Cost: ${total_cost[0]:.4f}")


async def metrics_export() -> None:
    """Export metrics to CSV"""
    from az_os.cli import app
    import csv
    import os
    
    output_path = "metrics_export.csv"
    tracker = CostTracker()
    
    async with connect(tracker.db_path) as db:
        cursor = await db.execute("SELECT * FROM metrics ORDER BY timestamp DESC")
        rows = await cursor.fetchall()
        
        with open(output_path, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([desc[0] for desc in cursor.description])
            writer.writerows(rows)
    
    print(f"Metrics exported to {output_path}")


# Register CLI commands
app = typer.Typer()
app.command()(metrics_show)
app.command()(metrics_export)