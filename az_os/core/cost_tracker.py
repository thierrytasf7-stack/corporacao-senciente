import asyncio
import logging
from typing import Dict, List, Optional, Union
from datetime import datetime, timedelta
from enum import Enum

import httpx
from pydantic import BaseModel, Field

from az_os.data.sqlite_repository import SQLiteRepository
from az_os.data.models import Cost, Task

logger = logging.getLogger(__name__)


class CostMetric(BaseModel):
    tokens: int = Field(default=0, description="Total tokens processed")
    cost: float = Field(default=0.0, description="Total cost in USD")
    requests: int = Field(default=0, description="Total requests made")
    average_cost_per_request: float = Field(default=0.0, description="Average cost per request")
    average_tokens_per_request: int = Field(default=0, description="Average tokens per request")


class CostPeriod(Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class CostTracker:
    def __init__(self, repository: SQLiteRepository):
        self.repository = repository
        self.api_cache: Dict[str, float] = {}
        self.cache_ttl: Dict[str, datetime] = {}
        self.cache_duration = timedelta(minutes=5)
        
    async def track_cost(self, task_id: str, tokens: int, model: str, provider: str) -> float:
        """Track cost for a task and return the calculated cost"""
        # Get pricing for the model
        price_per_token = await self.get_model_pricing(model, provider)
        
        if price_per_token is None:
            logger.warning(f"No pricing found for model {model} from provider {provider}")
            return 0.0
            
        # Calculate cost
        cost = tokens * price_per_token
        
        # Create cost record
        cost_record = Cost(
            id=f"cost-{task_id}",
            task_id=task_id,
            tokens=tokens,
            model=model,
            provider=provider,
            cost=cost,
            timestamp=datetime.now()
        )
        
        await self.repository.create_cost(cost_record)
        
        logger.info(f"Tracked cost: {cost_record.cost:.6f} USD for {tokens} tokens")
        return cost

    async def get_model_pricing(self, model: str, provider: str) -> Optional[float]:
        """Get pricing for a specific model from a provider"""
        cache_key = f"{provider}:{model}"
        
        # Check cache first
        if cache_key in self.cache_ttl and datetime.now() < self.cache_ttl[cache_key]:
            return self.api_cache.get(cache_key)
            
        # Get pricing from repository (or external API)
        pricing = await self.repository.get_model_pricing(model, provider)
        
        if pricing:
            self.api_cache[cache_key] = pricing
            self.cache_ttl[cache_key] = datetime.now() + self.cache_duration
            return pricing
            
        return None

    async def get_cost_metrics(self, period: CostPeriod = CostPeriod.DAILY) -> CostMetric:
        """Get cost metrics for a specific period"""
        now = datetime.now()
        
        # Calculate period start
        if period == CostPeriod.HOURLY:
            start_time = now - timedelta(hours=1)
        elif period == CostPeriod.DAILY:
            start_time = now - timedelta(days=1)
        elif period == CostPeriod.WEEKLY:
            start_time = now - timedelta(weeks=1)
        elif period == CostPeriod.MONTHLY:
            start_time = now - timedelta(days=30)
        elif period == CostPeriod.YEARLY:
            start_time = now - timedelta(days=365)
        else:
            start_time = now - timedelta(days=1)
            
        costs = await self.repository.get_costs(start_time)
        
        if not costs:
            return CostMetric()
            
        total_tokens = sum(cost.tokens for cost in costs)
        total_cost = sum(cost.cost for cost in costs)
        total_requests = len(costs)
        
        return CostMetric(
            tokens=total_tokens,
            cost=total_cost,
            requests=total_requests,
            average_cost_per_request=total_cost / total_requests if total_requests > 0 else 0.0,
            average_tokens_per_request=total_tokens // total_requests if total_requests > 0 else 0
        )

    async def get_cost_breakdown(self, period: CostPeriod = CostPeriod.DAILY) -> List[Dict[str, Any]]:
        """Get cost breakdown by model and provider"""
        now = datetime.now()
        
        # Calculate period start
        if period == CostPeriod.HOURLY:
            start_time = now - timedelta(hours=1)
        elif period == CostPeriod.DAILY:
            start_time = now - timedelta(days=1)
        elif period == CostPeriod.WEEKLY:
            start_time = now - timedelta(weeks=1)
        elif period == CostPeriod.MONTHLY:
            start_time = now - timedelta(days=30)
        elif period == CostPeriod.YEARLY:
            start_time = now - timedelta(days=365)
        else:
            start_time = now - timedelta(days=1)
            
        costs = await self.repository.get_costs(start_time)
        
        breakdown = {}
        for cost in costs:
            key = f"{cost.provider}:{cost.model}"
            if key not in breakdown:
                breakdown[key] = CostMetric()
                
            breakdown[key].tokens += cost.tokens
            breakdown[key].cost += cost.cost
            breakdown[key].requests += 1
        
        # Convert to list and calculate averages
        result = []
        for key, metric in breakdown.items():
            provider, model = key.split(":")
            result.append({
                "provider": provider,
                "model": model,
                "tokens": metric.tokens,
                "cost": metric.cost,
                "requests": metric.requests,
                "average_cost_per_request": metric.cost / metric.requests if metric.requests > 0 else 0.0,
                "average_tokens_per_request": metric.tokens // metric.requests if metric.requests > 0 else 0
            })
        
        return result

    async def set_budget_alert(self, amount: float, alert_percentage: float = 80.0) -> None:
        """Set budget alert threshold"""
        await self.repository.set_budget_alert(amount, alert_percentage)
        logger.info(f"Budget set to ${amount:.2f} with {alert_percentage}% alert threshold")

    async def check_budget(self) -> Dict[str, Any]:
        """Check current budget status"""
        budget = await self.repository.get_budget()
        if not budget:
            return {"error": "No budget configured"}
            
        # Get current costs
        current_costs = await self.get_cost_metrics(CostPeriod.MONTHLY)
        
        spent_percentage = (current_costs.cost / budget["amount"]) * 100 if budget["amount"] > 0 else 0
        alert_threshold = budget["amount"] * (budget["alert_percentage"] / 100)
        
        return {
            "budget_amount": budget["amount"],
            "spent_amount": current_costs.cost,
            "spent_percentage": spent_percentage,
            "alert_threshold": alert_threshold,
            "alert_percentage": budget["alert_percentage"],
            "alert_triggered": current_costs.cost >= alert_threshold
        }


# CLI Commands
async def cost_show(period: str = "daily") -> None:
    """Show cost metrics for a specific period"""
    from az_os.cli import app
    
    # Map period string to enum
    period_map = {
        "hourly": CostPeriod.HOURLY,
        "daily": CostPeriod.DAILY,
        "weekly": CostPeriod.WEEKLY,
        "monthly": CostPeriod.MONTHLY,
        "yearly": CostPeriod.YEARLY
    }
    
    period_enum = period_map.get(period.lower(), CostPeriod.DAILY)
    
    # Get cost metrics
    from az_os.core.cost_tracker import CostTracker
    from az_os.data.sqlite_repository import SQLiteRepository
    
    repository = SQLiteRepository()
    tracker = CostTracker(repository)
    metrics = await tracker.get_cost_metrics(period_enum)
    
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    
    console = Console()
    
    # Summary panel
    summary = f"[bold]Total Cost:[/] ${metrics.cost:.6f}\n"
    summary += f"[bold]Total Tokens:[/] {metrics.tokens}\n"
    summary += f"[bold]Total Requests:[/] {metrics.requests}\n"
    summary += f"[bold]Avg Cost/Request:[/] ${metrics.average_cost_per_request:.6f}\n"
    summary += f"[bold]Avg Tokens/Request:[/] {metrics.average_tokens_per_request}\n"
    
    console.print(Panel(
        summary,
        title=f"Cost Metrics ({period.capitalize()})",
        style="green"
    ))


async def cost_breakdown(period: str = "daily") -> None:
    """Show cost breakdown by model and provider"""
    from az_os.cli import app
    
    # Map period string to enum
    period_map = {
        "hourly": CostPeriod.HOURLY,
        "daily": CostPeriod.DAILY,
        "weekly": CostPeriod.WEEKLY,
        "monthly": CostPeriod.MONTHLY,
        "yearly": CostPeriod.YEARLY
    }
    
    period_enum = period_map.get(period.lower(), CostPeriod.DAILY)
    
    # Get cost breakdown
    from az_os.core.cost_tracker import CostTracker
    from az_os.data.sqlite_repository import SQLiteRepository
    
    repository = SQLiteRepository()
    tracker = CostTracker(repository)
    breakdown = await tracker.get_cost_breakdown(period_enum)
    
    from rich.console import Console
    from rich.table import Table
    
    console = Console()
    table = Table(title=f"Cost Breakdown ({period.capitalize()})")
    table.add_column("Provider", style="cyan", no_wrap=True)
    table.add_column("Model", style="magenta", no_wrap=True)
    table.add_column("Tokens", style="green")
    table.add_column("Cost", style="yellow")
    table.add_column("Requests", style="blue")
    table.add_column("Avg Cost/Request", style="red")
    table.add_column("Avg Tokens/Request", style="green")
    
    for item in breakdown:
        table.add_row(
            item["provider"],
            item["model"],
            str(item["tokens"]),
            f"${item['cost']:.6f}",
            str(item["requests"]),
            f"${item['average_cost_per_request']:.6f}",
            str(item["average_tokens_per_request"])
        )
    
    console.print(table)


async def cost_budget_set(amount: float, alert_percentage: float = 80.0) -> None:
    """Set budget and alert threshold"""
    from az_os.cli import app
    
    from az_os.core.cost_tracker import CostTracker
    from az_os.data.sqlite_repository import SQLiteRepository
    
    repository = SQLiteRepository()
    tracker = CostTracker(repository)
    await tracker.set_budget_alert(amount, alert_percentage)
    
    from rich.console import Console
    from rich.panel import Panel
    
    console = Console()
    console.print(Panel(
        f"[bold]Budget:[/] ${amount:.2f}\n" 
        f"[bold]Alert Threshold:[/] {alert_percentage}%",
        title="Budget Configured",
        style="green"
    ))


async def cost_budget_check() -> None:
    """Check current budget status"""
    from az_os.cli import app
    
    from az_os.core.cost_tracker import CostTracker
    from az_os.data.sqlite_repository import SQLiteRepository
    
    repository = SQLiteRepository()
    tracker = CostTracker(repository)
    status = await tracker.check_budget()
    
    from rich.console import Console
    from rich.panel import Panel
    
    console = Console()
    
    if "error" in status:
        console.print(Panel(
            f"[bold red]Error:[/] {status['error']}",
            title="Budget Status",
            style="red"
        ))
    else:
        alert_style = "red" if status["alert_triggered"] else "green"
        alert_text = "[bold red]ALERT: Budget threshold exceeded![/]" if status["alert_triggered"] else "[bold green]Budget OK[/]"
        
        details = f"[bold]Budget:[/] ${status['budget_amount']:.2f}\n"
        details += f"[bold]Spent:[/] ${status['spent_amount']:.2f} ({status['spent_percentage']:.1f}%)\n"
        details += f"[bold]Alert Threshold:[/] ${status['alert_threshold']:.2f} ({status['alert_percentage']}%)\n"
        details += f"[bold]Status:[/] {alert_text}\n"
        
        console.print(Panel(
            details,
            title="Budget Status",
            style=alert_style
        ))


# Register CLI commands
async def register_cost_commands() -> None:
    from az_os.cli import app
    
    @app.command()
    async def cost_show(period: str = "daily"):
        """Show cost metrics for a specific period"""
        await az_os.core.cost_tracker.cost_show(period)
    
    @app.command()
    async def cost_breakdown(period: str = "daily"):
        """Show cost breakdown by model and provider"""
        await az_os.core.cost_tracker.cost_breakdown(period)
    
    @app.command()
    async def cost_budget_set(amount: float, alert_percentage: float = 80.0):
        """Set budget and alert threshold"""
        await az_os.core.cost_tracker.cost_budget_set(amount, alert_percentage)
    
    @app.command()
    async def cost_budget_check():
        """Check current budget status"""
        await az_os.core.cost_tracker.cost_budget_check()