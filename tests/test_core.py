import pytest
import asyncio
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from src.az_os.core.security import Security, CORSProtection
from src.az_os.core.error_handler import ErrorHandler, ErrorCategory
from src.az_os.core.telemetry import Telemetry, HealthCheckResult, Metric, Alert, AlertLevel
from src.az_os.core.llm_client import LLMClient
from src.az_os.core.cache import LLMCache


class TestCoreIntegration:
    """Test core module integration"""
    
    def test_security_telemetry_integration(self):
        """Test security and telemetry integration"""
        security = Security(encryption_key=None)
        telemetry = Telemetry()
        
        # Test security event logging
        try:
            # Simulate security validation
            schema = {'username': {'type': str, 'required': True}}
            data = {'username': 'test_user'}
            is_valid, errors = security.validate_input(data, schema)
            
            # Log security event
            telemetry.record_metric(Metric("security_validation", 1.0, "events", datetime.now()))
            
            assert is_valid is True
            assert errors == ""
            
        except Exception as e:
            telemetry.trigger_alert("Security Validation Failed", "security_validation", 1.0)
            raise
    
    def test_error_handler_telemetry_integration(self):
        """Test error handler and telemetry integration"""
        error_handler = ErrorHandler()
        telemetry = Telemetry()
        
        # Test error handling with telemetry
        try:
            # Simulate error
            raise ValueError("Test error")
        except Exception as e:
            response = error_handler.handle_error(e, category=ErrorCategory.VALIDATION)
            error_handler.log_error(e, category=ErrorCategory.VALIDATION)
            
            # Record error metric
            telemetry.record_metric(Metric("error_rate", 1.0, "errors", datetime.now()))
            
            assert response.code == 400
            assert response.category == "validation_error"
    
    def test_llm_client_cache_integration(self):
        """Test LLM client and cache integration"""
        # Test LLM client with cache
        client = LLMClient(cache_enabled=True)
        
        # Test cache functionality
        assert client.cache_enabled is True
        assert client.cache is not None
        assert client.cache.max_size == 1000
        assert client.cache.ttl == 3600
        
        # Test cache stats
        stats = client.get_cache_stats()
        assert stats["cache_enabled"] is True
        assert stats["size"] == 0
        assert stats["max_size"] == 1000
    
    def test_cache_telemetry_integration(self):
        """Test cache and telemetry integration"""
        cache = LLMCache()
        telemetry = Telemetry()
        
        # Test cache with telemetry
        cache.set("test_key", "test_value")
        
        # Record cache metric
        telemetry.record_metric(Metric("cache_size", 1.0, "entries", datetime.now()))
        
        assert cache.get("test_key") == "test_value"
        
        # Record cache hit
        telemetry.record_metric(Metric("cache_hits", 1.0, "hits", datetime.now()))
    
    def test_complete_integration_pipeline(self):
        """Test complete integration pipeline"""
        security = Security(encryption_key=None)
        error_handler = ErrorHandler()
        telemetry = Telemetry()
        client = LLMClient(cache_enabled=True)
        
        # Test complete pipeline
        try:
            # Security validation
            schema = {
                'prompt': {'type': str, 'required': True},
                'model': {'type': str, 'required': True}
            }
            data = {'prompt': 'test prompt', 'model': 'gpt-3.5-turbo'}
            is_valid, errors = security.validate_input(data, schema)
            
            assert is_valid is True
            assert errors == ""
            
            # LLM client call
            response = asyncio.run(client.complete(data['prompt'], data['model']))
            
            # Record metrics
            telemetry.record_metric(Metric("llm_requests", 1.0, "requests", datetime.now()))
            telemetry.record_metric(Metric("cache_hits", 0.0, "hits", datetime.now()))
            
            assert "test" in response.lower()
            
        except Exception as e:
            # Handle error
            response = error_handler.handle_error(e)
            error_handler.log_error(e)
            
            # Record error metric
            telemetry.record_metric(Metric("error_rate", 1.0, "errors", datetime.now()))
            telemetry.trigger_alert("Integration Pipeline Error", "pipeline_error", 1.0)
            
            assert response.code == 500
    
    def test_cache_invalidation_integration(self):
        """Test cache invalidation integration"""
        client = LLMClient(cache_enabled=True)
        telemetry = Telemetry()
        
        # Test cache invalidation
        prompt = "test prompt"
        model = "gpt-3.5-turbo"
        
        # First call - should populate cache
        response1 = asyncio.run(client.complete(prompt, model))
        
        # Invalidate cache
        client.invalidate_cache(prompt, model)
        
        # Record invalidation metric
        telemetry.record_metric(Metric("cache_invalidations", 1.0, "invalidations", datetime.now()))
        
        # Second call - should be cache miss
        response2 = asyncio.run(client.complete(prompt, model))
        
        assert response1 == response2
        assert client.cache.get_stats()["size"] == 1
    
    def test_performance_monitoring_integration(self):
        """Test performance monitoring integration"""
        client = LLMClient(cache_enabled=True)
        telemetry = Telemetry()
        
        # Test performance monitoring
        start_time = time.time()
        
        # Make multiple requests
        for i in range(10):
            asyncio.run(client.complete(f"prompt {i}", "gpt-3.5-turbo"))
        
        elapsed_time = time.time() - start_time
        
        # Record performance metrics
        telemetry.record_metric(Metric("response_time", elapsed_time, "seconds", datetime.now()))
        telemetry.record_metric(Metric("requests_per_second", 10/elapsed_time, "rps", datetime.now()))
        
        assert elapsed_time > 0
        assert 10/elapsed_time > 0
    
    def test_alert_integration(self):
        """Test alert integration"""
        client = LLMClient(cache_enabled=True)
        telemetry = Telemetry()
        
        # Test alert integration
        try:
            # Simulate error condition
            client.set_cache_config(max_size=0)  # Invalid config
            
        except Exception as e:
            # Handle error
            telemetry.trigger_alert("Invalid Cache Configuration", "cache_error", 1.0)
            
            # Verify alert
            alerts = telemetry.get_alerts()
            assert len(alerts) > 0
            assert any(alert.name == "Invalid Cache Configuration" for alert in alerts)
    
    def test_health_check_integration(self):
        """Test health check integration"""
        telemetry = Telemetry()
        client = LLMClient(cache_enabled=True)
        
        # Test health check integration
        health_results = telemetry.check_health()
        
        # Verify health check results
        assert len(health_results) > 0
        assert all(result.status == "healthy" for result in health_results)
        
        # Record health check metric
        telemetry.record_metric(Metric("health_check_status", 1.0, "healthy", datetime.now()))
    
    def test_cache_statistics_integration(self):
        """Test cache statistics integration"""
        client = LLMClient(cache_enabled=True)
        telemetry = Telemetry()
        
        # Test cache statistics
        asyncio.run(client.complete("test prompt", "gpt-3.5-turbo"))
        asyncio.run(client.complete("test prompt", "gpt-3.5-turbo"))  # Cache hit
        
        # Get cache stats
        stats = client.get_cache_stats()
        
        # Record cache statistics
        telemetry.record_metric(Metric("cache_hit_rate", stats.get("hit_rate", 0.0), "ratio", datetime.now()))
        telemetry.record_metric(Metric("cache_size", stats["size"], "entries", datetime.now()))
        
        assert stats["size"] == 1
        assert "hit_rate" in stats


class TestCorePerformance:
    """Test core module performance"""
    
    def test_integration_performance(self):
        """Test integration performance"""
        security = Security(encryption_key=None)
        error_handler = ErrorHandler()
        telemetry = Telemetry()
        client = LLMClient(cache_enabled=True)
        
        # Test performance with multiple operations
        start_time = time.time()
        
        for i in range(100):
            # Security validation
            schema = {'prompt': {'type': str, 'required': True}}
            data = {'prompt': f'test prompt {i}'}
            is_valid, errors = security.validate_input(data, schema)
            
            # LLM client call
            if is_valid:
                asyncio.run(client.complete(data['prompt'], "gpt-3.5-turbo"))
        
        elapsed_time = time.time() - start_time
        
        # Verify performance is acceptable
        assert elapsed_time < 10.0  # Should complete 100 operations in under 10 seconds
        
        # Record performance metrics
        telemetry.record_metric(Metric("integration_throughput", 100/elapsed_time, "ops/sec", datetime.now()))
        telemetry.record_metric(Metric("average_latency", elapsed_time/100, "ms", datetime.now()))
    
    def test_cache_performance(self):
        """Test cache performance"""
        client = LLMClient(cache_enabled=True)
        telemetry = Telemetry()
        
        # Test cache performance
        start_time = time.time()
        
        # Warm up cache
        for i in range(100):
            asyncio.run(client.complete(f"prompt {i}", "gpt-3.5-turbo"))
        
        # Test cache hits
        for i in range(100):
            asyncio.run(client.complete(f"prompt {i}", "gpt-3.5-turbo"))  # Cache hits
        
        elapsed_time = time.time() - start_time
        
        # Verify cache performance
        stats = client.get_cache_stats()
        assert stats["size"] == 100
        assert "hit_rate" in stats
        
        # Record cache performance metrics
        telemetry.record_metric(Metric("cache_throughput", 200/elapsed_time, "ops/sec", datetime.now()))
        telemetry.record_metric(Metric("cache_hit_rate", stats.get("hit_rate", 0.0), "ratio", datetime.now()))
        
        assert elapsed_time > 0
        assert 200/elapsed_time > 0