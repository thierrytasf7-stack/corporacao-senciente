import pytest
import asyncio
from datetime import datetime, timedelta
from src.az_os.core.cache import LLMCache, CacheInvalidationStrategy


class TestLLMCache:
    """Test LLMCache implementation."""
    
    def test_cache_initialization(self):
        """Test cache initialization with default values."""
        cache = LLMCache()
        
        assert cache.max_size == 1000
        assert cache.ttl == 3600
        assert len(cache._cache) == 0
        assert len(cache._access_order) == 0
    
    def test_cache_custom_configuration(self):
        """Test cache with custom configuration."""
        cache = LLMCache(max_size=500, ttl=1800)
        
        assert cache.max_size == 500
        assert cache.ttl == 1800
    
    def test_cache_key_generation(self):
        """Test cache key generation."""
        cache = LLMCache()
        
        key1 = cache._generate_key("test prompt", "gpt-3.5-turbo")
        key2 = cache._generate_key("test prompt", "gpt-3.5-turbo")
        key3 = cache._generate_key("different prompt", "gpt-3.5-turbo")
        
        assert key1 == key2
        assert key1 != key3
    
    def test_cache_set_get(self):
        """Test basic set and get operations."""
        cache = LLMCache()
        
        cache.set("test_key", "test_value")
        value = cache.get("test_key")
        
        assert value == "test_value"
        assert len(cache._cache) == 1
        assert len(cache._access_order) == 1
    
    def test_cache_miss(self):
        """Test cache miss scenario."""
        cache = LLMCache()
        
        value = cache.get("non_existent_key")
        
        assert value is None
    
    def test_cache_ttl_expiration(self):
        """Test cache TTL expiration."""
        cache = LLMCache(ttl=1)  # 1 second TTL
        
        cache.set("test_key", "test_value")
        value = cache.get("test_key")
        
        assert value == "test_value"
        
        # Wait for TTL to expire
        time.sleep(2)
        
        expired_value = cache.get("test_key")
        assert expired_value is None
        assert len(cache._cache) == 0
    
    def test_lru_eviction(self):
        """Test LRU eviction when cache reaches max size."""
        cache = LLMCache(max_size=3)
        
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")
        
        # Access key1 to make it most recently used
        cache.get("key1")
        
        # Add fourth item, should evict least recently used (key2)
        cache.set("key4", "value4")
        
        assert cache.get("key1") == "value1"  # Should still exist
        assert cache.get("key2") is None  # Should be evicted
        assert cache.get("key3") == "value3"
        assert cache.get("key4") == "value4"
        assert len(cache._cache) == 3
    
    def test_cache_invalidation(self):
        """Test cache invalidation."""
        cache = LLMCache()
        
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        cache.invalidate("key1")
        
        assert cache.get("key1") is None
        assert cache.get("key2") == "value2"
        assert len(cache._cache) == 1
    
    def test_cache_clear(self):
        """Test cache clear operation."""
        cache = LLMCache()
        
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        cache.clear()
        
        assert cache.get("key1") is None
        assert cache.get("key2") is None
        assert len(cache._cache) == 0
        assert len(cache._access_order) == 0
    
    def test_cache_stats(self):
        """Test cache statistics."""
        cache = LLMCache(max_size=100)
        
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        stats = cache.get_stats()
        
        assert stats["size"] == 2
        assert stats["max_size"] == 100
        assert stats["ttl"] == 3600
        assert stats["hit_rate"] == 0.0


class TestCacheInvalidationStrategy:
    """Test cache invalidation strategies."""
    
    def test_invalidate_by_model(self):
        """Test invalidation by model."""
        cache = LLMCache(max_size=5)
        
        # Add entries with different models
        cache.set(cache._generate_key("prompt1", "gpt-3.5-turbo"), "value1")
        cache.set(cache._generate_key("prompt2", "gpt-4"), "value2")
        cache.set(cache._generate_key("prompt3", "gpt-3.5-turbo"), "value3")
        
        # Invalidate all gpt-3.5-turbo entries
        CacheInvalidationStrategy.invalidate_by_model(cache, "gpt-3.5-turbo")
        
        # Only gpt-4 entry should remain
        assert cache.get(cache._generate_key("prompt1", "gpt-3.5-turbo")) is None
        assert cache.get(cache._generate_key("prompt2", "gpt-4")) == "value2"
        assert cache.get(cache._generate_key("prompt3", "gpt-3.5-turbo")) is None
        assert len(cache._cache) == 1
    
    def test_invalidate_by_prompt_pattern(self):
        """Test invalidation by prompt pattern."""
        cache = LLMCache(max_size=5)
        
        # Add entries with different prompts
        cache.set(cache._generate_key("order status", "gpt-3.5-turbo"), "value1")
        cache.set(cache._generate_key("product info", "gpt-3.5-turbo"), "value2")
        cache.set(cache._generate_key("order tracking", "gpt-3.5-turbo"), "value3")
        
        # Invalidate all entries containing "order"
        CacheInvalidationStrategy.invalidate_by_prompt_pattern(cache, "order")
        
        # Only product info entry should remain
        assert cache.get(cache._generate_key("order status", "gpt-3.5-turbo")) is None
        assert cache.get(cache._generate_key("product info", "gpt-3.5-turbo")) == "value2"
        assert cache.get(cache._generate_key("order tracking", "gpt-3.5-turbo")) is None
        assert len(cache._cache) == 1
    
    def test_invalidate_all(self):
        """Test complete cache invalidation."""
        cache = LLMCache(max_size=5)
        
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")
        
        CacheInvalidationStrategy.invalidate_all(cache)
        
        assert cache.get("key1") is None
        assert cache.get("key2") is None
        assert cache.get("key3") is None
        assert len(cache._cache) == 0


@pytest.mark.asyncio
async def test_cache_performance_benchmark():
    """Test cache performance improvement."""
    from src.az_os.core.llm_client import LLMClient
    import time
    
    # Create client with cache enabled
    cached_client = LLMClient(cache_enabled=True)
    
    # Create client with cache disabled
    uncached_client = LLMClient(cache_enabled=False)
    
    test_prompt = "What is the capital of France?"
    
    # Warm up cache
    await cached_client.complete(test_prompt)
    
    # Measure uncached performance
    start_time = time.time()
    for _ in range(100):
        await uncached_client.complete(test_prompt)
    uncached_duration = time.time() - start_time
    
    # Measure cached performance
    start_time = time.time()
    for _ in range(100):
        await cached_client.complete(test_prompt)
    cached_duration = time.time() - start_time
    
    # Calculate speedup
    speedup = uncached_duration / cached_duration
    
    # Assert at least 2x speedup
    assert speedup >= 2.0, f"Expected at least 2x speedup, got {speedup}x"
    
    # Verify cache hit rate
    stats = cached_client.get_cache_stats()
    assert stats["hit_rate"] > 0.5, "Expected hit rate > 50%"


@pytest.mark.asyncio
async def test_cache_integration():
    """Test complete cache integration with LLM client."""
    from src.az_os.core.llm_client import LLMClient
    
    client = LLMClient(cache_enabled=True)
    
    test_prompt = "What is 2 + 2?"
    
    # First call - should be cache miss
    response1 = await client.complete(test_prompt)
    
    # Second call - should be cache hit
    response2 = await client.complete(test_prompt)
    
    # Responses should be identical
    assert response1 == response2
    
    # Check cache stats
    stats = client.get_cache_stats()
    assert stats["size"] == 1
    assert stats["hit_rate"] > 0.0


@pytest.mark.asyncio
async def test_cache_invalidation_integration():
    """Test cache invalidation with LLM client."""
    from src.az_os.core.llm_client import LLMClient
    from src.az_os.core.cache import CacheInvalidationStrategy
    
    client = LLMClient(cache_enabled=True)
    
    # Add some cached responses
    await client.complete("prompt1", "gpt-3.5-turbo")
    await client.complete("prompt2", "gpt-4")
    await client.complete("prompt3", "gpt-3.5-turbo")
    
    # Invalidate all gpt-3.5-turbo responses
    CacheInvalidationStrategy.invalidate_by_model(client.cache, "gpt-3.5-turbo")
    
    # Only gpt-4 response should remain
    stats = client.get_cache_stats()
    assert stats["size"] == 1
    assert client.cache.get(client.cache._generate_key("prompt2", "gpt-4")) is not None


@pytest.mark.asyncio
async def test_cache_memory_usage():
    """Test cache memory usage."""
    from src.az_os.core.llm_client import LLMClient
    import sys
    
    client = LLMClient(cache_enabled=True, max_cache_size=1000)
    
    # Add 1000 entries
    for i in range(1000):
        await client.complete(f"test prompt {i}")
    
    stats = client.get_cache_stats()
    assert stats["size"] == 1000
    
    # Memory usage check (simplified)
    # In real scenario, would use memory_profiler or similar
    # This is a basic sanity check
    assert stats["size"] <= 1000


@pytest.mark.asyncio
async def test_cache_ttl_behavior():
    """Test cache TTL behavior."""
    from src.az_os.core.llm_client import LLMClient
    import time
    
    # Create client with short TTL
    client = LLMClient(cache_enabled=True, cache_ttl=1)
    
    # Add response
    await client.complete("test prompt")
    
    # Wait for TTL to expire
    time.sleep(2)
    
    # Should be cache miss now
    stats = client.get_cache_stats()
    assert stats["size"] == 0


@pytest.mark.asyncio
async def test_cache_hit_rate_calculation():
    """Test cache hit rate calculation."""
    from src.az_os.core.llm_client import LLMClient
    
    client = LLMClient(cache_enabled=True)
    
    test_prompt = "What is the meaning of life?"
    
    # First call - miss
    await client.complete(test_prompt)
    
    # Second call - hit
    await client.complete(test_prompt)
    
    # Third call - hit
    await client.complete(test_prompt)
    
    stats = client.get_cache_stats()
    
    # With 3 requests and 2 hits, hit rate should be 66.67%
    assert stats["hit_rate"] >= 0.66