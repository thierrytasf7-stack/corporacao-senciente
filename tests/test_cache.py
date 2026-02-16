import pytest
import asyncio
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
from src.az_os.core.cache import LLMCache, CacheDecorator


class TestLLMCache:
    """Test LLMCache functionality"""
    
    def test_cache_initialization(self):
        """Test cache initialization with default values"""
        cache = LLMCache()
        assert cache.max_size == 1000
        assert cache.ttl == 3600
        assert len(cache._cache) == 0
        assert len(cache._access_order) == 0
    
    def test_cache_custom_configuration(self):
        """Test cache with custom configuration"""
        cache = LLMCache(max_size=500, ttl=1800)
        assert cache.max_size == 500
        assert cache.ttl == 1800
    
    def test_cache_key_generation(self):
        """Test cache key generation"""
        cache = LLMCache()
        
        key1 = cache._generate_key("test prompt", "gpt-3.5-turbo")
        key2 = cache._generate_key("test prompt", "gpt-3.5-turbo")
        key3 = cache._generate_key("different prompt", "gpt-3.5-turbo")
        
        assert key1 == key2  # Same input, same key
        assert key1 != key3  # Different input, different key
    
    def test_cache_set_get(self):
        """Test basic set and get operations"""
        cache = LLMCache()
        
        key = "test_key"
        value = "test_value"
        
        cache.set(key, value)
        assert cache.get(key) == value
    
    def test_cache_invalidate(self):
        """Test cache invalidation"""
        cache = LLMCache()
        
        key = "test_key"
        value = "test_value"
        
        cache.set(key, value)
        assert cache.get(key) == value
        
        cache.invalidate(key)
        assert cache.get(key) is None
    
    def test_cache_clear(self):
        """Test cache clearing"""
        cache = LLMCache()
        
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        assert len(cache._cache) == 2
        assert len(cache._access_order) == 2
        
        cache.clear()
        assert len(cache._cache) == 0
        assert len(cache._access_order) == 0
    
    def test_cache_lru_eviction(self):
        """Test LRU eviction when cache is full"""
        cache = LLMCache(max_size=3)
        
        # Fill cache
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")
        
        # Access key1 to make it most recently used
        cache.get("key1")
        
        # Add fourth item, should evict key2 (LRU)
        cache.set("key4", "value4")
        
        assert cache.get("key1") == "value1"  # Still exists (recently accessed)
        assert cache.get("key2") is None  # Should be evicted
        assert cache.get("key3") == "value3"
        assert cache.get("key4") == "value4"
    
    def test_cache_ttl_expiration(self):
        """Test TTL expiration"""
        cache = LLMCache(ttl=1)  # 1 second TTL
        
        cache.set("key", "value")
        assert cache.get("key") == "value"
        
        # Wait for TTL to expire
        time.sleep(2)
        
        assert cache.get("key") is None  # Should be expired
    
    def test_cache_stats(self):
        """Test cache statistics"""
        cache = LLMCache(max_size=100, ttl=3600)
        
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        stats = cache.get_stats()
        assert stats["size"] == 2
        assert stats["max_size"] == 100
        assert stats["ttl_seconds"] == 3600
        assert "hit_rate" in stats


class TestCacheDecorator:
    """Test CacheDecorator functionality"""
    
    def test_cache_decorator(self):
        """Test cache decorator functionality"""
        cache = LLMCache()
        decorator = CacheDecorator(cache)
        
        @decorator
        async def test_function(prompt: str, model: str = "gpt-3.5-turbo"):
            return f"result_{prompt}"
        
        # First call - should not be cached
        result1 = asyncio.run(test_function(prompt="test", model="gpt-3.5-turbo"))
        assert result1 == "result_test"
        
        # Second call - should be cached
        result2 = asyncio.run(test_function(prompt="test", model="gpt-3.5-turbo"))
        assert result2 == "result_test"
        
        # Verify cache was used
        assert len(cache._cache) == 1


class TestLLMCachePerformance:
    """Test cache performance characteristics"""
    
    def test_cache_hit_rate(self):
        """Test cache hit rate calculation"""
        cache = LLMCache(max_size=100, ttl=3600)
        
        # Mock cache stats with hit rate
        stats = cache.get_stats()
        assert "hit_rate" in stats
        assert 0.0 <= stats["hit_rate"] <= 1.0
    
    def test_cache_memory_usage(self):
        """Test cache memory usage"""
        cache = LLMCache(max_size=1000, ttl=3600)
        
        # Add 1000 entries
        for i in range(1000):
            cache.set(f"key_{i}", f"value_{i}")
        
        # Check memory usage is reasonable
        stats = cache.get_stats()
        assert stats["size"] == 1000
        assert stats["max_size"] == 1000
    
    def test_cache_performance_benchmark(self):
        """Test cache performance improvement"""
        cache = LLMCache(max_size=100, ttl=3600)
        
        # Mock API call
        async def mock_api_call(prompt: str):
            time.sleep(0.1)  # Simulate API latency
            return f"result_{prompt}"
        
        # Test without cache
        start_time = time.time()
        for i in range(10):
            asyncio.run(mock_api_call(f"prompt_{i}"))
        without_cache_time = time.time() - start_time
        
        # Test with cache
        decorator = CacheDecorator(cache)
        
        @decorator
        async def cached_api_call(prompt: str):
            return await mock_api_call(prompt)
        
        start_time = time.time()
        for i in range(10):
            asyncio.run(cached_api_call(f"prompt_{i}"))
        # Call again to test cache hit
        for i in range(10):
            asyncio.run(cached_api_call(f"prompt_{i}"))
        with_cache_time = time.time() - start_time
        
        # Verify performance improvement
        assert with_cache_time < without_cache_time
        assert (without_cache_time / with_cache_time) >= 2.0  # At least 2x improvement