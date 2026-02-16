"""Tests for cache module."""

import pytest
import time
from az_os.core.cache import LLMCache


class TestLLMCache:
    """Test LLM cache functionality."""

    def test_cache_initialization(self):
        """Test cache can be initialized."""
        cache = LLMCache(max_size=100, ttl=60)
        assert cache.max_size == 100
        assert cache.ttl == 60
        assert len(cache._cache) == 0

    def test_cache_set_get(self):
        """Test basic set and get."""
        cache = LLMCache()
        key = cache._generate_key("test prompt", "test-model")

        cache.set(key, "test response")
        result = cache.get(key)

        assert result == "test response"

    def test_cache_miss(self):
        """Test cache miss returns None."""
        cache = LLMCache()
        result = cache.get("nonexistent-key")
        assert result is None

    def test_cache_ttl_expiration(self):
        """Test TTL expiration."""
        cache = LLMCache(ttl=1)  # 1 second TTL
        key = cache._generate_key("test prompt", "test-model")

        cache.set(key, "test response")
        assert cache.get(key) == "test response"

        # Wait for TTL to expire
        time.sleep(1.1)
        assert cache.get(key) is None

    def test_cache_lru_eviction(self):
        """Test LRU eviction at max size."""
        cache = LLMCache(max_size=3)

        # Fill cache
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")

        # Access key1 to make it more recent
        cache.get("key1")

        # Add key4, should evict key2 (oldest)
        cache.set("key4", "value4")

        assert cache.get("key1") == "value1"  # Still exists (accessed recently)
        assert cache.get("key2") is None       # Evicted (oldest)
        assert cache.get("key3") == "value3"  # Still exists
        assert cache.get("key4") == "value4"  # New entry

    def test_cache_invalidate(self):
        """Test manual cache invalidation."""
        cache = LLMCache()
        key = cache._generate_key("test prompt", "test-model")

        cache.set(key, "test response")
        assert cache.get(key) == "test response"

        cache.invalidate(key)
        assert cache.get(key) is None

    def test_cache_clear(self):
        """Test clearing all cache."""
        cache = LLMCache()

        cache.set("key1", "value1")
        cache.set("key2", "value2")
        assert len(cache._cache) == 2

        cache.clear()
        assert len(cache._cache) == 0
        assert cache.get("key1") is None
        assert cache.get("key2") is None

    def test_cache_key_generation(self):
        """Test cache key generation is consistent."""
        cache = LLMCache()

        key1 = cache._generate_key("prompt", "model", temp=0.7)
        key2 = cache._generate_key("prompt", "model", temp=0.7)

        assert key1 == key2

        # Different params should generate different keys
        key3 = cache._generate_key("prompt", "model", temp=0.8)
        assert key1 != key3

    def test_cache_stats(self):
        """Test cache statistics."""
        cache = LLMCache()

        # Initial stats
        stats = cache.get_stats()
        assert stats["hits"] == 0
        assert stats["misses"] == 0
        assert stats["size"] == 0
        assert stats["hit_rate"] == 0.0

        # Add and access
        key = cache._generate_key("test", "model")
        cache.set(key, "value")

        cache.get(key)  # Hit
        cache.get("nonexistent")  # Miss

        stats = cache.get_stats()
        assert stats["hits"] == 1
        assert stats["misses"] == 1
        assert stats["size"] == 1
        assert stats["hit_rate"] == 50.0

    def test_cache_hit_rate_calculation(self):
        """Test hit rate calculation."""
        cache = LLMCache()

        # 3 hits, 1 miss = 75% hit rate
        key = cache._generate_key("test", "model")
        cache.set(key, "value")

        cache.get(key)  # Hit
        cache.get(key)  # Hit
        cache.get(key)  # Hit
        cache.get("miss")  # Miss

        stats = cache.get_stats()
        assert stats["hit_rate"] == 75.0


@pytest.mark.parametrize("max_size,ttl", [
    (100, 60),
    (1000, 3600),
    (10000, 7200),
])
def test_cache_parametrized(max_size, ttl):
    """Parametrized tests for cache configuration."""
    cache = LLMCache(max_size=max_size, ttl=ttl)
    assert cache.max_size == max_size
    assert cache.ttl == ttl


class TestCachePerformance:
    """Performance tests for cache."""

    def test_cache_performance_improvement(self):
        """Test cache improves performance."""
        cache = LLMCache()
        key = cache._generate_key("test prompt", "test-model")

        # Simulate expensive operation (first call - cache miss)
        start = time.time()
        result = cache.get(key)
        if result is None:
            time.sleep(0.01)  # Simulate API call (10ms)
            cache.set(key, "response")
        first_call_time = time.time() - start

        # Second call should be faster (cache hit)
        start = time.time()
        result = cache.get(key)
        second_call_time = time.time() - start

        assert result == "response"
        assert second_call_time < first_call_time  # Should be much faster

    def test_cache_memory_efficiency(self):
        """Test cache doesn't grow unbounded."""
        cache = LLMCache(max_size=100)

        # Add 200 entries
        for i in range(200):
            key = cache._generate_key(f"prompt{i}", "model")
            cache.set(key, f"response{i}")

        # Cache should be capped at max_size
        assert len(cache._cache) == 100

