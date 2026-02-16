"""Cost tracking for LLM API calls in AZ-OS."""
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime


@dataclass
class CostEntry:
    """Single cost tracking entry."""
    model: str
    tokens_in: int
    tokens_out: int
    cost_usd: float
    timestamp: datetime = field(default_factory=datetime.now)


class CostTracker:
    """Track costs of LLM API calls."""

    # Cost per 1M tokens (approximate 2026 pricing)
    MODEL_COSTS = {
        'claude-3-sonnet': {'input': 0.003, 'output': 0.015},
        'claude-opus-4-6': {'input': 0.015, 'output': 0.075},
        'gemini-1.5-pro': {'input': 0.001, 'output': 0.002},
        'mistral-small': {'input': 0.0005, 'output': 0.0015},
        'deepseek-r1': {'input': 0.0001, 'output': 0.0003},
    }

    def __init__(self, db=None):
        """Initialize cost tracker."""
        self.db = db
        self.entries: List[CostEntry] = []

    def track(
        self,
        model: str,
        tokens_in: int,
        tokens_out: int,
        task_id: Optional[str] = None,
    ) -> float:
        """Track a model call and return cost."""
        cost = self.calculate_cost(model, tokens_in, tokens_out)
        entry = CostEntry(
            model=model,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost,
        )
        self.entries.append(entry)

        # Log to database if available
        if self.db:
            try:
                import asyncio
                asyncio.run(self._log_to_db(task_id, entry))
            except Exception:
                pass

        return cost

    async def _log_to_db(self, task_id: Optional[str], entry: CostEntry):
        """Log cost entry to database."""
        # Stub: will integrate with storage.py
        pass

    def calculate_cost(self, model: str, tokens_in: int, tokens_out: int) -> float:
        """Calculate cost for a model call."""
        costs = self.MODEL_COSTS.get(model, {'input': 0.0001, 'output': 0.0003})
        cost_in = (tokens_in / 1_000_000) * costs['input']
        cost_out = (tokens_out / 1_000_000) * costs['output']
        return round(cost_in + cost_out, 6)

    def total_cost(self) -> float:
        """Get total cost of all calls."""
        return round(sum(e.cost_usd for e in self.entries), 6)

    def cost_by_model(self) -> Dict[str, float]:
        """Get total cost grouped by model."""
        result = {}
        for entry in self.entries:
            result[entry.model] = result.get(entry.model, 0) + entry.cost_usd
        return {k: round(v, 6) for k, v in result.items()}

    def cost_by_date(self) -> Dict[str, float]:
        """Get total cost grouped by date."""
        result = {}
        for entry in self.entries:
            date_key = entry.timestamp.strftime('%Y-%m-%d')
            result[date_key] = result.get(date_key, 0) + entry.cost_usd
        return {k: round(v, 6) for k, v in result.items()}
