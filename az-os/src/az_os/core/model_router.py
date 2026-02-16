"""Intelligent model selection router for optimal LLM choice."""
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum


class TaskComplexity(Enum):
    """Task complexity levels."""
    SIMPLE = "simple"  # <100 tokens, basic Q&A
    MEDIUM = "medium"  # 100-500 tokens, reasoning
    COMPLEX = "complex"  # >500 tokens, multi-step


@dataclass
class ModelProfile:
    """Model performance profile."""
    name: str
    cost_per_1m_tokens: float
    avg_latency_ms: float
    quality_score: float = 7.0
    success_rate: float = 0.95


@dataclass
class RoutingDecision:
    """Decision made by router."""
    model: str
    reasoning: str
    estimated_cost: float
    estimated_latency: float


class ModelRouter:
    """Route tasks to optimal LLM model based on heuristics."""

    MODELS = {
        "claude-3-sonnet": ModelProfile(
            name="claude-3-sonnet",
            cost_per_1m_tokens=3.0,
            avg_latency_ms=2000,
            quality_score=9.0,
            success_rate=0.98
        ),
        "gemini-1.5-pro": ModelProfile(
            name="gemini-1.5-pro",
            cost_per_1m_tokens=1.0,
            avg_latency_ms=1500,
            quality_score=8.5,
            success_rate=0.96
        ),
        "mistral-small": ModelProfile(
            name="mistral-small",
            cost_per_1m_tokens=0.5,
            avg_latency_ms=1000,
            quality_score=7.0,
            success_rate=0.92
        ),
        "deepseek-r1": ModelProfile(
            name="deepseek-r1",
            cost_per_1m_tokens=0.1,
            avg_latency_ms=3000,
            quality_score=6.5,
            success_rate=0.88
        ),
    }

    def __init__(self):
        """Initialize router."""
        self.decision_history = []
        self.model_stats = {m: {"successes": 0, "failures": 0} for m in self.MODELS}

    def select_model(self, task_description: str, task_type: str = "general",
                    quality_requirement: float = 7.0, budget: Optional[float] = None) -> RoutingDecision:
        """Select best model for task."""
        # Estimate task complexity
        complexity = self._estimate_complexity(task_description)

        # Get candidate models
        candidates = self._rank_models(complexity, quality_requirement, budget)

        if not candidates:
            # Fallback to cheapest
            model_name = "mistral-small"
        else:
            model_name = candidates[0]

        profile = self.MODELS[model_name]
        decision = RoutingDecision(
            model=model_name,
            reasoning=f"Selected {model_name} for {complexity.value} task (quality={profile.quality_score}/10)",
            estimated_cost=(len(task_description) / 1_000_000) * profile.cost_per_1m_tokens,
            estimated_latency=profile.avg_latency_ms
        )

        self.decision_history.append(decision)
        return decision

    def _estimate_complexity(self, task_description: str) -> TaskComplexity:
        """Estimate task complexity from description."""
        token_estimate = len(task_description.split()) * 1.3

        if token_estimate < 100:
            return TaskComplexity.SIMPLE
        elif token_estimate < 500:
            return TaskComplexity.MEDIUM
        else:
            return TaskComplexity.COMPLEX

    def _rank_models(self, complexity: TaskComplexity, quality_min: float = 7.0,
                     budget: Optional[float] = None) -> List[str]:
        """Rank models by suitability."""
        candidates = []

        for name, profile in self.MODELS.items():
            # Quality filter
            if profile.quality_score < quality_min:
                continue

            # Budget filter
            if budget and profile.cost_per_1m_tokens > budget:
                continue

            # Score based on complexity + quality + cost
            if complexity == TaskComplexity.SIMPLE:
                score = (profile.success_rate * 0.4 +
                        (1.0 / (profile.cost_per_1m_tokens / 10)) * 0.6)
            elif complexity == TaskComplexity.COMPLEX:
                score = (profile.quality_score * 0.5 +
                        profile.success_rate * 0.5)
            else:
                score = (profile.quality_score * 0.4 +
                        profile.success_rate * 0.4 +
                        (1.0 / (profile.cost_per_1m_tokens / 10)) * 0.2)

            candidates.append((name, score))

        # Sort by score (descending)
        candidates.sort(key=lambda x: x[1], reverse=True)
        return [name for name, _ in candidates]

    def learn_from_result(self, model: str, success: bool, task_type: str = "general"):
        """Update model statistics based on result."""
        if model in self.model_stats:
            if success:
                self.model_stats[model]["successes"] += 1
            else:
                self.model_stats[model]["failures"] += 1

    def get_model_stats(self) -> Dict:
        """Get statistics on model performance."""
        stats = {}
        for model, data in self.model_stats.items():
            total = data["successes"] + data["failures"]
            success_rate = (data["successes"] / total * 100) if total > 0 else 0
            stats[model] = {
                "successes": data["successes"],
                "failures": data["failures"],
                "success_rate": f"{success_rate:.1f}%"
            }
        return stats
