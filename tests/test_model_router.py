"""
Unit tests for ModelRouter functionality
Tests model selection logic, ranking, and fallback behavior.
"""

import pytest
from unittest.mock import Mock, patch
from src.az_os.core.model_router import ModelRouter, ModelType, TaskComplexity, Task, ModelInfo
from datetime import datetime, timedelta


class TestModelRouter:
    """Test ModelRouter functionality"""
    
    @pytest.fixture
    def model_router(self):
        """Create a ModelRouter instance."""
        return ModelRouter()
    
    @pytest.fixture
    def sample_task_simple(self):
        """Create a simple task."""
        return Task(
            task_type="simple_query",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50,
            urgency=False
        )
    
    @pytest.fixture
    def sample_task_medium(self):
        """Create a medium task."""
        return Task(
            task_type="data_analysis",
            complexity=TaskComplexity.MEDIUM,
            prompt_length=200,
            urgency=True
        )
    
    @pytest.fixture
    def sample_task_complex(self):
        """Create a complex task."""
        return Task(
            task_type="code_generation",
            complexity=TaskComplexity.COMPLEX,
            prompt_length=500,
            urgency=False
        )
    
    def test_model_selection_simple_task(self, model_router, sample_task_simple):
        """Test model selection for simple tasks"""
        model_type, score = model_router.select_model(sample_task_simple)
        
        # Should prefer fast/cheap models for simple tasks
        assert score >= 7.0
        assert model_type in [ModelType.FAST, ModelType.GPT35]
        assert model_type != ModelType.CLAUDE  # Claude is too expensive for simple tasks
    
    def test_model_selection_medium_task(self, model_router, sample_task_medium):
        """Test model selection for medium tasks"""
        model_type, score = model_router.select_model(sample_task_medium)
        
        # Should balance quality and cost for medium tasks
        assert score >= 8.0
        assert model_type in [ModelType.GPT35, ModelType.GPT4]
        assert model_type != ModelType.FAST  # Fast model not good enough for medium tasks
    
    def test_model_selection_complex_task(self, model_router, sample_task_complex):
        """Test model selection for complex tasks"""
        model_type, score = model_router.select_model(sample_task_complex)
        
        # Should prefer high quality models for complex tasks
        assert score >= 9.0
        assert model_type in [ModelType.CLAUDE, ModelType.GPT4]
        assert model_type != ModelType.FAST and model_type != ModelType.GPT35
    
    def test_model_ranking_logic(self, model_router, sample_task_simple):
        """Test model ranking logic"""
        ranked = model_router.rank_models(sample_task_simple)
        
        # Should return all models ranked by score
        assert len(ranked) == 4
        assert all(isinstance(item, tuple) for item in ranked)
        assert all(isinstance(item[0], ModelType) for item in ranked)
        assert all(isinstance(item[1], float) for item in ranked)
        
        # Models should be in descending order
        scores = [score for _, score in ranked]
        assert scores == sorted(scores, reverse=True)
    
    def test_model_ranking_considerations(self, model_router, sample_task_medium):
        """Test ranking considers quality, cost, and latency"""
        ranked = model_router.rank_models(sample_task_medium)
        
        # Verify ranking considers multiple factors
        claude_rank = next(i for i, (model, _) in enumerate(ranked) if model == ModelType.CLAUDE)
        gpt4_rank = next(i for i, (model, _) in enumerate(ranked) if model == ModelType.GPT4)
        gpt35_rank = next(i for i, (model, _) in enumerate(ranked) if model == ModelType.GPT35)
        fast_rank = next(i for i, (model, _) in enumerate(ranked) if model == ModelType.FAST)
        
        # Quality should be primary factor, then cost/latency
        assert claude_rank < gpt4_rank  # Claude higher quality
        assert gpt4_rank < gpt35_rank  # GPT-4 better than GPT-3.5
        assert gpt35_rank < fast_rank  # GPT-3.5 better than Fast
    
    def test_fallback_to_best_available(self, model_router, sample_task_complex):
        """Test fallback to best available model"""
        # Mock all models below threshold
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 6.5),
            (ModelType.GPT35, 6.0),
            (ModelType.GPT4, 5.5),
            (ModelType.CLAUDE, 5.0)
        ]):
            
            model_type, score = model_router.select_model(sample_task_complex)
            
            # Should fallback to best available (FAST) even though below threshold
            assert model_type == ModelType.FAST
            assert score == 6.5
    
    def test_simple_task_prefers_fast_models(self, model_router, sample_task_simple):
        """Test simple tasks prefer fast models"""
        model_type, score = model_router.select_model(sample_task_simple)
        
        # Simple tasks should prefer fast/cheap models
        assert model_type == ModelType.FAST or model_type == ModelType.GPT35
        assert score >= 7.0
        assert model_type != ModelType.CLAUDE  # Too expensive for simple tasks
    
    def test_medium_task_balances_quality_cost(self, model_router, sample_task_medium):
        """Test medium tasks balance quality and cost"""
        model_type, score = model_router.select_model(sample_task_medium)
        
        # Medium tasks should balance quality and cost
        assert score >= 8.0
        assert model_type in [ModelType.GPT35, ModelType.GPT4]
        assert model_type != ModelType.FAST  # Not good enough
        assert model_type != ModelType.CLAUDE  # Too expensive
    
    def test_complex_task_requires_high_quality(self, model_router, sample_task_complex):
        """Test complex tasks require high quality"""
        model_type, score = model_router.select_model(sample_task_complex)
        
        # Complex tasks should require high quality
        assert score >= 9.0
        assert model_type in [ModelType.CLAUDE, ModelType.GPT4]
        assert model_type != ModelType.FAST and model_type != ModelType.GPT35
    
    def test_model_info_initialization(self, model_router):
        """Test model info initialization"""
        models = model_router.models
        
        # Verify all models are initialized
        assert len(models) == 4
        assert ModelType.CLAUDE in models
        assert ModelType.GPT4 in models
        assert ModelType.GPT35 in models
        assert ModelType.FAST in models
        
        # Verify model properties
        claude = models[ModelType.CLAUDE]
        assert claude.name == "Claude-3-5-Sonnet"
        assert claude.quality_score == 9.5
        assert claude.cost_per_token == 0.015
        assert claude.avg_latency_ms == 3000
        assert claude.success_rate == {}
    
    def test_model_selection_with_urgency(self, model_router):
        """Test model selection considers urgency"""
        # Create urgent simple task
        urgent_simple = Task(
            task_type="urgent_query",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50,
            urgency=True
        )
        
        # Create non-urgent simple task
        non_urgent_simple = Task(
            task_type="non_urgent_query",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50,
            urgency=False
        )
        
        # Urgent task might prefer higher quality despite cost
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 7.0),
            (ModelType.GPT35, 8.0),
            (ModelType.GPT4, 9.0),
            (ModelType.CLAUDE, 9.5)
        ]):
            
            urgent_model, _ = model_router.select_model(urgent_simple)
            non_urgent_model, _ = model_router.select_model(non_urgent_simple)
            
            # Urgent task might prefer better model
            assert urgent_model != ModelType.FAST
            assert non_urgent_model == ModelType.FAST
    
    def test_model_selection_with_prompt_length(self, model_router):
        """Test model selection considers prompt length"""
        # Short prompt
        short_prompt = Task(
            task_type="short_query",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=10,
            urgency=False
        )
        
        # Long prompt
        long_prompt = Task(
            task_type="long_query",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=1000,
            urgency=False
        )
        
        # Long prompts might prefer models with better context handling
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 7.0),
            (ModelType.GPT35, 8.0),
            (ModelType.GPT4, 9.0),
            (ModelType.CLAUDE, 9.5)
        ]):
            
            short_model, _ = model_router.select_model(short_prompt)
            long_model, _ = model_router.select_model(long_prompt)
            
            # Long prompts might prefer better models
            assert short_model == ModelType.FAST
            assert long_model != ModelType.FAST
    
    def test_model_selection_with_task_type(self, model_router):
        """Test model selection considers task type"""
        # Creative task
        creative_task = Task(
            task_type="creative_writing",
            complexity=TaskComplexity.MEDIUM,
            prompt_length=200,
            urgency=False
        )
        
        # Technical task
        technical_task = Task(
            task_type="code_review",
            complexity=TaskComplexity.MEDIUM,
            prompt_length=200,
            urgency=False
        )
        
        # Different task types might prefer different models
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 7.0),
            (ModelType.GPT35, 8.0),
            (ModelType.GPT4, 9.0),
            (ModelType.CLAUDE, 9.5)
        ]):
            
            creative_model, _ = model_router.select_model(creative_task)
            technical_model, _ = model_router.select_model(technical_task)
            
            # Creative tasks might prefer Claude, technical might prefer GPT-4
            assert creative_model == ModelType.CLAUDE
            assert technical_model == ModelType.GPT4
    
    def test_model_selection_with_learning_enabled(self, model_router):
        """Test model selection with learning enabled"""
        # Learning should improve selection over time
        model_router.learning_enabled = True
        
        # First selection
        first_model, first_score = model_router.select_model(sample_task_simple)
        
        # Simulate learning from success
        model_router.models[first_model].success_rate[sample_task_simple.task_type] = 0.9
        
        # Second selection should be influenced by learning
        second_model, second_score = model_router.select_model(sample_task_simple)
        
        # Learning might change selection
        assert first_model == second_model  # Or different if learning suggests better option
    
    def test_model_selection_with_learning_disabled(self, model_router):
        """Test model selection with learning disabled"""
        model_router.learning_enabled = False
        
        # Create task
        task = Task(
            task_type="test_task",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50,
            urgency=False
        )
        
        # Selection should be based only on static criteria
        model_type, score = model_router.select_model(task)
        
        # Should still work without learning
        assert model_type is not None
        assert score >= 0
    
    def test_success_threshold_enforcement(self, model_router):
        """Test success threshold enforcement"""
        model_router.success_threshold = 0.8
        
        # Create task
        task = Task(
            task_type="test_task",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50,
            urgency=False
        )
        
        # Mock models with different success rates
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 7.0),      # success_rate: 0.6
            (ModelType.GPT35, 8.0),     # success_rate: 0.85
            (ModelType.GPT4, 9.0),      # success_rate: 0.75
            (ModelType.CLAUDE, 9.5)     # success_rate: 0.9
        ]):
            
            # Set success rates
            model_router.models[ModelType.FAST].success_rate[task.task_type] = 0.6
            model_router.models[ModelType.GPT35].success_rate[task.task_type] = 0.85
            model_router.models[ModelType.GPT4].success_rate[task.task_type] = 0.75
            model_router.models[ModelType.CLAUDE].success_rate[task.task_type] = 0.9
            
            model_type, score = model_router.select_model(task)
            
            # Should select model with success_rate >= threshold
            assert model_type == ModelType.CLAUDE
            assert score == 9.5
    
    def test_success_threshold_fallback(self, model_router):
        """Test fallback when no models meet success threshold"""
        model_router.success_threshold = 0.9
        
        # Create task
        task = Task(
            task_type="test_task",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50,
            urgency=False
        )
        
        # Mock models with low success rates
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 7.0),      # success_rate: 0.6
            (ModelType.GPT35, 8.0),     # success_rate: 0.85
            (ModelType.GPT4, 9.0),      # success_rate: 0.75
            (ModelType.CLAUDE, 9.5)     # success_rate: 0.88
        ]):
            
            # Set success rates
            model_router.models[ModelType.FAST].success_rate[task.task_type] = 0.6
            model_router.models[ModelType.GPT35].success_rate[task.task_type] = 0.85
            model_router.models[ModelType.GPT4].success_rate[task.task_type] = 0.75
            model_router.models[ModelType.CLAUDE].success_rate[task.task_type] = 0.88
            
            model_type, score = model_router.select_model(task)
            
            # Should fallback to best available despite low success rate
            assert model_type == ModelType.CLAUDE
            assert score == 9.5
    
    def test_model_selection_with_cost_optimization(self, model_router):
        """Test model selection with cost optimization"""
        # Create task where cost matters
        cost_sensitive_task = Task(
            task_type="cost_sensitive",
            complexity=TaskComplexity.MEDIUM,
            prompt_length=200,
            urgency=False
        )
        
        # Mock models with different cost profiles
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 7.0),      # cost: 0.001
            (ModelType.GPT35, 8.0),     # cost: 0.002
            (ModelType.GPT4, 9.0),      # cost: 0.012
            (ModelType.CLAUDE, 9.5)     # cost: 0.015
        ]):
            
            model_type, score = model_router.select_model(cost_sensitive_task)
            
            # Should prefer cost-effective models
            assert model_type == ModelType.GPT35
            assert score == 8.0
    
    def test_model_selection_with_latency_optimization(self, model_router):
        """Test model selection with latency optimization"""
        # Create task where speed matters
        latency_sensitive_task = Task(
            task_type="real_time",
            complexity=TaskComplexity.SIMPLE,
            prompt_length=50,
            urgency=True
        )
        
        # Mock models with different latency profiles
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 7.0),      # latency: 800ms
            (ModelType.GPT35, 8.0),     # latency: 1500ms
            (ModelType.GPT4, 9.0),      # latency: 2500ms
            (ModelType.CLAUDE, 9.5)     # latency: 3000ms
        ]):
            
            model_type, score = model_router.select_model(latency_sensitive_task)
            
            # Should prefer fast models
            assert model_type == ModelType.FAST
            assert score == 7.0
    
    def test_model_selection_with_quality_priority(self, model_router):
        """Test model selection with quality priority"""
        # Create task where quality is paramount
        quality_critical_task = Task(
            task_type="mission_critical",
            complexity=TaskComplexity.COMPLEX,
            prompt_length=500,
            urgency=False
        )
        
        # Mock models with different quality profiles
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 7.0),      # quality: 7.0
            (ModelType.GPT35, 8.0),     # quality: 8.0
            (ModelType.GPT4, 9.0),      # quality: 9.2
            (ModelType.CLAUDE, 9.5)     # quality: 9.5
        ]):
            
            model_type, score = model_router.select_model(quality_critical_task)
            
            # Should prefer highest quality model
            assert model_type == ModelType.CLAUDE
            assert score == 9.5
    
    def test_model_selection_with_multiple_criteria(self, model_router):
        """Test model selection with multiple criteria"""
        # Create task with multiple requirements
        balanced_task = Task(
            task_type="balanced",
            complexity=TaskComplexity.MEDIUM,
            prompt_length=200,
            urgency=True
        )
        
        # Mock models with various profiles
        with patch.object(ModelRouter, 'rank_models', return_value=[
            (ModelType.FAST, 7.0),      # quality: 7.0, cost: 0.001, latency: 800ms
            (ModelType.GPT35, 8.0),     # quality: 8.0, cost: 0.002, latency: 1500ms
            (ModelType.GPT4, 9.0),      # quality: 9.2, cost: 0.012, latency: 2500ms
            (ModelType.CLAUDE, 9.5)     # quality: 9.5, cost: 0.015, latency: 3000ms
        ]):
            
            model_type, score = model_router.select_model(balanced_task)
            
            # Should balance all criteria
            assert model_type == ModelType.GPT4
            assert score == 9.0
    
    def test_model_selection_with_empty_ranking(self, model_router):
        """Test model selection with empty ranking"""
        # Mock empty ranking
        with patch.object(ModelRouter, 'rank_models', return_value=[]):
            
            # Create task
            task = Task(
                task_type="test_task",
                complexity=TaskComplexity.SIMPLE,
                prompt_length=50,
                urgency=False
            )
            
            # Should handle empty ranking gracefully
            with pytest.raises(IndexError):
                model_router.select_model(task)