from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import random


class TaskComplexity(Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"


class ModelType(Enum):
    CLAUDE = "claude"
    GPT4 = "gpt4"
    GPT35 = "gpt35"
    FAST = "fast"


@dataclass
class ModelInfo:
    name: str
    quality_score: float  # 0-10
    cost_per_token: float
    avg_latency_ms: int
    success_rate: Dict[str, float] = None  # task_type -> success_rate


@dataclass
class Task:
    task_type: str
    complexity: TaskComplexity
    prompt_length: int
    urgency: bool = False


class ModelRouter:
    def __init__(self):
        self.models: Dict[ModelType, ModelInfo] = {
            ModelType.CLAUDE: ModelInfo(
                name="Claude-3-5-Sonnet",
                quality_score=9.5,
                cost_per_token=0.015,
                avg_latency_ms=3000,
                success_rate={}
            ),
            ModelType.GPT4: ModelInfo(
                name="GPT-4-Turbo",
                quality_score=9.2,
                cost_per_token=0.012,
                avg_latency_ms=2500,
                success_rate={}
            ),
            ModelType.GPT35: ModelInfo(
                name="GPT-3.5-Turbo",
                quality_score=8.0,
                cost_per_token=0.002,
                avg_latency_ms=1500,
                success_rate={}
            ),
            ModelType.FAST: ModelInfo(
                name="Fast-LLM",
                quality_score=7.0,
                cost_per_token=0.001,
                avg_latency_ms=800,
                success_rate={}
            )
        }
        self.learning_enabled = True
        self.success_threshold = 0.7

    def select_model(self, task: Task) -> Tuple[ModelType, float]:
        """Select best model based on task complexity and requirements"""
        # Rank models by heuristic
        ranked = self.rank_models(task)
        
        # Select based on complexity
        if task.complexity == TaskComplexity.SIMPLE:
            # Prefer fast/cheap models for simple tasks
            for model_type, score in ranked:
                if score >= 7.0:
                    return model_type, score
        elif task.complexity == TaskComplexity.MEDIUM:
            # Balance quality and cost
            for model_type, score in ranked:
                if score >= 8.0:
                    return model_type, score
        else:  # COMPLEX
            # Prefer high quality models
            for model_type, score in ranked:
                if score >= 9.0:
                    return model_type, score
        
        # Fallback to best available
        return ranked[0][0], ranked[0][1]

    def rank_models(self, task: Task) -> List[Tuple[ModelType, float]]:
        """Rank models based on quality, cost, latency"""
        rankings = []
        
        for model_type, model in self.models.items():
            # Calculate weighted score
            quality_weight = 0.5
            cost_weight = 0.3
            latency_weight = 0.2
            
            # Apply task-specific adjustments
            if task.urgency:
                latency_weight = 0.4
                cost_weight = 0.1
            
            # Get learning-based success rate if available
            success_rate = model.success_rate.get(task.task_type, 0.5)
            
            # Calculate composite score
            score = (
                quality_weight * model.quality_score +
                cost_weight * (1.0 / (model.cost_per_token + 0.001)) +
                latency_weight * (1.0 / (model.avg_latency_ms + 1)) +
                2.0 * success_rate  # Learning bonus
            )
            
            rankings.append((model_type, score))
        
        # Sort by score descending
        rankings.sort(key=lambda x: x[1], reverse=True)
        return rankings

    def learn_from_result(self, task: Task, model_type: ModelType, success: bool):
        """Update success rates based on task outcome"""
        if not self.learning_enabled:
            return
            
        model = self.models[model_type]
        current_rate = model.success_rate.get(task.task_type, 0.5)
        
        # Simple moving average update
        new_rate = (current_rate * 0.7) + (1.0 if success else 0.0) * 0.3
        model.success_rate[task.task_type] = new_rate

    def get_model_info(self, model_type: ModelType) -> ModelInfo:
        """Get detailed info about a model"""
        return self.models.get(model_type)

    def get_all_models(self) -> Dict[ModelType, ModelInfo]:
        """Get all available models"""
        return self.models


# CLI Command
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Model Router CLI")
    parser.add_argument("command", choices=["select", "rank", "stats"], help="Command to execute")
    parser.add_argument("--task-type", type=str, help="Task type for selection")
    parser.add_argument("--complexity", choices=["simple", "medium", "complex"], help="Task complexity")
    parser.add_argument("--prompt-length", type=int, default=100, help="Prompt length in tokens")
    parser.add_argument("--urgency", action="store_true", help="Mark task as urgent")
    
    args = parser.parse_args()
    
    router = ModelRouter()
    
    if args.command == "select":
        task = Task(
            task_type=args.task_type or "generic",
            complexity=TaskComplexity[args.complexity.upper()],
            prompt_length=args.prompt_length,
            urgency=args.urgency
        )
        model_type, score = router.select_model(task)
        print(f"Selected model: {model_type.value}")
        print(f"Confidence score: {score:.2f}")
        
    elif args.command == "rank":
        task = Task(
            task_type=args.task_type or "generic",
            complexity=TaskComplexity[args.complexity.upper()],
            prompt_length=args.prompt_length,
            urgency=args.urgency
        )
        rankings = router.rank_models(task)
        print("Model Rankings:")
        for model_type, score in rankings:
            model = router.get_model_info(model_type)
            print(f"  {model.name}: {score:.2f} (cost: ${model.cost_per_token:.4f}/token, latency: {model.avg_latency_ms}ms)")
    
    elif args.command == "stats":
        print("Model Statistics:")
        for model_type, model in router.get_all_models().items():
            print(f"  {model.name}:")
            print(f"    Quality: {model.quality_score}/10")
            print(f"    Cost: ${model.cost_per_token:.4f}/token")
            print(f"    Latency: {model.avg_latency_ms}ms")
            print(f"    Success rates: {model.success_rate}")