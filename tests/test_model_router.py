"""
Unit tests for ModelRouter functionality
Tests model selection logic, fallback behavior, and learning mechanism.
"""

import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from az_os.core.model_router import ModelRouter, TaskComplexity, ModelType, ModelInfo, Task


class TestModelRouter:
    """Test ModelRouter functionality"""
    
    @pytest.fixture
    def model_router(self):
        """Create a ModelRouter instance."""
        return ModelRouter()
    
    @pytest.fixture
    def sample_tasks(self):
        """Create sample tasks for different complexities."""
        return {
            "simple": Task(
                task_type="simple_task",
                complexity=TaskComplexity.SIMPLE,
                prompt_length=50,
                urgency=False
            ),
            "medium": Task(
                task_type="medium_task",
                complexity=TaskComplexity.MEDIUM,
                prompt_length=200,
                urgency=False
            ),
            "complex": Task(
                task_type="complex_task",
                complexity=TaskComplexity.COMPLEX,
                prompt_length=500,
                urgency=False
            )
        }
    
    def test_simple_task_selection(self, model_router, sample_tasks):
        """Test SIMPLE task selection."""
        task = sample_tasks["simple"]
        
        model_type, score = model_router.select_model(task)
        
        # Should prefer fast/cheap models for simple tasks
        assert score >= 7.0
        assert model_type in [ModelType.FAST, ModelType.GPT35]
        assert model_router.models[model_type].cost_per_token <= 0.002
        assert model_router.models[model_type].avg_latency_ms <= 1500
    
    def test_medium_task_selection(self, model_router, sample_tasks):
        """Test MEDIUM task selection."""
        task = sample_tasks["medium"]
        
        model_type, score = model_router.select_model(task)
        
        # Should balance quality and cost for medium tasks
        assert score >= 8.0
        assert model_type in [ModelType.GPT35, ModelType.GPT4, ModelType.CLAUDE]
        assert 0.002 <= model_router.models[model_type].cost_per_token <= 0.015
        assert 1500 <= model_router.models[model_type].avg_latency_ms <= 3000
    
    def test_complex_task_selection(self, model_router, sample_tasks):
        """Test COMPLEX task selection."""
        task = sample_tasks["complex"]
        
        model_type, score = model_router.select_model(task)
        
        # Should prefer high quality models for complex tasks
        assert score >= 9.0
        assert model_type in [ModelType.CLAUDE, ModelType.GPT4]
        assert model_router.models[model_type].quality_score >= 9.0
        assert model_router.models[model_type].cost_per_token >= 0.012
    
    def test_urgency_prefers_faster_models(self, model_router, sample_tasks):
        """Test urgency prefers faster models."""
        urgent_task = sample_tasks["medium"]
        urgent_task.urgency = True
        
        model_type, score = model_router.select_model(urgent_task)
        
        # Should prefer faster models when urgent
        assert model_router.models[model_type].avg_latency_ms <= 2000
    
    def test_prompt_length_affects_selection(self, model_router, sample_tasks):
        """Test prompt length affects model selection."""
        long_task = sample_tasks["medium"]
        long_task.prompt_length = 1000  # Very long prompt
        
        model_type, score = model_router.select_model(long_task)
        
        # Should prefer models with better cost efficiency for long prompts
        assert model_router.models[model_type].cost_per_token <= 0.012
    
    def test_rank_models_quality_first(self, model_router):
        """Test model ranking prioritizes quality."""
        task = Task(
            task_type="quality_test",
            complexity=TaskComplexity.COMPLEX,
            prompt_length=100
        )
        
        ranked = model_router.rank_models(task)
        
        # Models should be ranked by quality score
        quality_scores = [model_router.models[model_type].quality_score for model_type, _ in ranked]
        assert quality_scores == sorted(quality_scores, reverse=True)
    
    def test_rank_models_cost_efficiency(self, model_router):
        """Test model ranking considers cost efficiency."""
        task = Task(
            task_type="cost_test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        ranked = model_router.rank_models(task)
        
        # For simple tasks, cost efficiency should matter
        cost_per_token = [model_router.models[model_type].cost_per_token for model_type, _ in ranked]
        assert cost_per_token == sorted(cost_per_token)
    
    def test_rank_models_latency_aware(self, model_router):
        """Test model ranking considers latency."""
        task = Task(
            task_type="latency_test",
            complexity=TaskComplexity.MEDIUM,
            prompt_length=200
        )
        
        ranked = model_router.rank_models(task)
        
        # Models should be ranked considering latency
        latencies = [model_router.models[model_type].avg_latency_ms for model_type, _ in ranked]
        assert latencies == sorted(latencies)
    
    def test_model_info_properties(self, model_router):
        """Test ModelInfo dataclass properties."""
        model_info = ModelInfo(
            name="Test Model",
            quality_score=8.5,
            cost_per_token=0.01,
            avg_latency_ms=2000,
            success_rate={"test": 0.9}
        )
        
        assert model_info.name == "Test Model"
        assert model_info.quality_score == 8.5
        assert model_info.cost_per_token == 0.01
        assert model_info.avg_latency_ms == 2000
        assert model_info.success_rate == {"test": 0.9}
    
    def test_task_dataclass_properties(self):
        """Test Task dataclass properties."""
        task = Task(
            task_type="test_task",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=100,
            urgency=True
        )
        
        assert task.task_type == "test_task"
        assert task.complexity == TaskComplexity.SIMPLE
        assert task.prompt_length == 100
        assert task.urgency is True
    
    def test_task_complexity_enum(self):
        """Test TaskComplexity enum values."""
        assert TaskComplexity.SIMPLE.value == "simple"
        assert TaskComplexity.MEDIUM.value == "medium"
        assert TaskComplexity.COMPLEX.value == "complex"
    
    def test_model_type_enum(self):
        """Test ModelType enum values."""
        assert ModelType.CLAUDE.value == "claude"
        assert ModelType.GPT4.value == "gpt4"
        assert ModelType.GPT35.value == "gpt35"
        assert ModelType.FAST.value == "fast"


class TestModelRouterFallback:
    """Test ModelRouter fallback behavior"""
    
    @pytest.fixture
    def model_router_with_failures(self):
        """Create ModelRouter with mocked failure rates."""
        router = ModelRouter()
        
        # Mock failure rates for testing
        router.models[ModelType.CLAUDE].success_rate = {"test": 0.6}
        router.models[ModelType.GPT4].success_rate = {"test": 0.8}
        router.models[ModelType.GPT35].success_rate = {"test": 0.9}
        router.models[ModelType.FAST].success_rate = {"test": 0.95}
        
        return router
    
    def test_fallback_when_preferred_model_unavailable(self, model_router_with_failures):
        """Test fallback when preferred model unavailable."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.COMPLEX,
            prompt_length=500
        )
        
        # Claude would normally be preferred but has low success rate
        model_type, score = model_router_with_failures.select_model(task)
        
        # Should fallback to GPT-4 which has better success rate
        assert model_type == ModelType.GPT4
        assert score >= 8.0
    
    def test_cost_based_fallback(self, model_router_with_failures):
        """Test cost-based fallback."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.MEDIUM,
            prompt_length=200
        )
        
        # GPT-4 would normally be selected but has higher cost
        model_type, score = model_router_with_failures.select_model(task)
        
        # Should fallback to GPT-3.5 which has better cost efficiency
        assert model_type == ModelType.GPT35
        assert score >= 8.0
    
    def test_quality_threshold_enforcement(self, model_router_with_failures):
        """Test quality threshold enforcement."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.COMPLEX,
            prompt_length=500
        )
        
        # All models have varying success rates
        model_type, score = model_router_with_failures.select_model(task)
        
        # Should enforce minimum quality threshold
        assert score >= 8.0  # Adjusted threshold for testing
    
    def test_fallback_to_best_available(self, model_router_with_failures):
        """Test fallback to best available model."""
        # Mock all models having very low success rates
        for model in model_router_with_failures.models.values():
            model.success_rate = {"test": 0.3}
        
        task = Task(
            task_type="test",
            complexity=TaskComplexity.COMPLEX,
            prompt_length=500
        )
        
        model_type, score = model_router_with_failures.select_model(task)
        
        # Should fallback to best available despite low scores
        assert model_type is not None
        assert score >= 0.0


class TestModelRouterLearning:
    """Test ModelRouter learning mechanism"""
    
    @pytest.fixture
    def learning_router(self):
        """Create ModelRouter with learning enabled."""
        router = ModelRouter()
        router.learning_enabled = True
        return router
    
    def test_model_performance_tracking(self, learning_router):
        """Test model performance tracking."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Simulate task execution
        model_type, _ = learning_router.select_model(task)
        
        # Record success
        learning_router.record_success(model_type, task.task_type)
        
        # Verify success rate updated
        success_rate = learning_router.models[model_type].success_rate.get(task.task_type, 0)
        assert success_rate > 0
    
    def test_model_performance_tracking_failure(self, learning_router):
        """Test model performance tracking for failures."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Simulate task execution
        model_type, _ = learning_router.select_model(task)
        
        # Record failure
        learning_router.record_failure(model_type, task.task_type)
        
        # Verify failure rate updated
        success_rate = learning_router.models[model_type].success_rate.get(task.task_type, 1)
        assert success_rate < 1
    
    def test_selection_improvement_over_time(self, learning_router):
        """Test selection improvement over time."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Initial selection
        initial_model, _ = learning_router.select_model(task)
        
        # Simulate multiple successful executions with different models
        for model_type in ModelType:
            if model_type != initial_model:
                learning_router.record_success(model_type, task.task_type)
        
        # New selection after learning
        new_model, _ = learning_router.select_model(task)
        
        # Should prefer model with better success rate
        assert new_model != initial_model
    
    def test_learning_state_persistence(self, learning_router):
        """Test learning state persistence."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Initial selection
        initial_model, _ = learning_router.select_model(task)
        
        # Simulate learning
        learning_router.record_success(initial_model, task.task_type)
        
        # Create new router instance
        new_router = ModelRouter()
        new_router.learning_enabled = True
        
        # Copy learned state
        for model_type, model in learning_router.models.items():
            new_router.models[model_type].success_rate = model.success_rate.copy()
        
        # Verify learned state persisted
        new_model, _ = new_router.select_model(task)
        assert new_model == initial_model
    
    def test_learning_disabled(self):
        """Test learning disabled behavior."""
        router = ModelRouter()
        router.learning_enabled = False
        
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Should not track performance when learning is disabled
        model_type, _ = router.select_model(task)
        
        # These methods should exist but not affect anything
        router.record_success(model_type, task.task_type)
        router.record_failure(model_type, task.task_type)
        
        # Selection should still work normally
        new_model, _ = router.select_model(task)
        assert new_model == model_type


class TestModelRouterErrorHandling:
    """Test error handling in ModelRouter"""
    
    def test_invalid_task_complexity(self):
        """Test handling of invalid task complexity."""
        router = ModelRouter()
        
        invalid_task = Task(
            task_type="test",
            complexity="invalid",  # Not a TaskComplexity enum
            prompt_length=100
        )
        
        with pytest.raises(ValueError) as exc_info:
            router.select_model(invalid_task)
        
        assert "Invalid task complexity" in str(exc_info.value)
    
    def test_negative_prompt_length(self):
        """Test handling of negative prompt length."""
        router = ModelRouter()
        
        invalid_task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=-100
        )
        
        with pytest.raises(ValueError) as exc_info:
            router.select_model(invalid_task)
        
        assert "Prompt length must be positive" in str(exc_info.value)
    
    def test_missing_task_type(self):
        """Test handling of missing task type."""
        router = ModelRouter()
        
        invalid_task = Task(
            task_type="",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=100
        )
        
        with pytest.raises(ValueError) as exc_info:
            router.select_model(invalid_task)
        
        assert "Task type cannot be empty" in str(exc_info.value)
    
    def test_empty_models_dictionary(self):
        """Test handling of empty models dictionary."""
        router = ModelRouter()
        router.models = {}
        
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=100
        )
        
        with pytest.raises(RuntimeError) as exc_info:
            router.select_model(task)
        
        assert "No models available" in str(exc_info.value)


class TestModelRouterMetrics:
    """Test metrics collection in ModelRouter"""
    
    def test_selection_metrics(self, model_router):
        """Test selection metrics collection."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Initial metrics
        initial_metrics = model_router.get_metrics()
        
        # Make selection
        model_type, score = model_router.select_model(task)
        
        # New metrics
        new_metrics = model_router.get_metrics()
        
        # Should track selection count
        assert new_metrics["selections"] == initial_metrics["selections"] + 1
        assert new_metrics["model_selections"].get(model_type.value, 0) == 1
    
    def test_cost_metrics(self, model_router):
        """Test cost metrics collection."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Make selection
        model_type, score = model_router.select_model(task)
        
        # Calculate expected cost
        expected_cost = model_router.models[model_type].cost_per_token * task.prompt_length
        
        # Verify cost metrics
        metrics = model_router.get_metrics()
        assert "total_cost" in metrics
        assert metrics["total_cost"] >= expected_cost
    
    def test_latency_metrics(self, model_router):
        """Test latency metrics collection."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Make selection
        model_type, score = model_router.select_model(task)
        
        # Verify latency metrics
        metrics = model_router.get_metrics()
        assert "total_latency_ms" in metrics
        assert metrics["total_latency_ms"] >= model_router.models[model_type].avg_latency_ms
    
    def test_quality_metrics(self, model_router):
        """Test quality metrics collection."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Make selection
        model_type, score = model_router.select_model(task)
        
        # Verify quality metrics
        metrics = model_router.get_metrics()
        assert "average_quality_score" in metrics
        assert metrics["average_quality_score"] >= 7.0
    
    def test_reset_metrics(self, model_router):
        """Test metrics reset functionality."""
        task = Task(
            task_type="test",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50
        )
        
        # Make selection
        model_type, score = model_router.select_model(task)
        
        # Reset metrics
        model_router.reset_metrics()
        
        # Verify metrics reset
        metrics = model_router.get_metrics()
        assert metrics["selections"] == 0
        assert metrics["total_cost"] == 0.0
        assert metrics["total_latency_ms"] == 0
        assert metrics["average_quality_score"] == 0.0
