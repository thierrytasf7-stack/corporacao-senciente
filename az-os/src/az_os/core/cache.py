"""LLM response caching with LRU and TTL."""
import hashlib
import json
import time
from typing import Optional, Dict, Any, Tuple


class LLMCache:
    """LRU cache with TTL for LLM responses.

    Features:
    - LRU (Least Recently Used) eviction policy
    - TTL (Time To Live) expiration
    - Configurable max size and TTL
    - Hash-based cache keys from prompt + model + params
    """

    def __init__(self, max_size: int = 1000, ttl: int = 3600):
        """Initialize cache.

        Args:
            max_size: Maximum number of cached entries (default 1000)
            ttl: Time to live in seconds (default 3600 = 1 hour)
        """
        self.max_size = max_size
        self.ttl = ttl
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._access_order: list = []
        self._hits = 0
        self._misses = 0

    def _generate_key(self, prompt: str, model: str, **kwargs) -> str:
        """Generate cache key from prompt + model + params.

        Args:
            prompt: The prompt text
            model: Model identifier
            **kwargs: Additional parameters (temperature, max_tokens, etc.)

        Returns:
            SHA256 hash as cache key
        """
        data = json.dumps({
            "prompt": prompt,
            "model": model,
            **kwargs
        }, sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        """Get cached value if exists and not expired.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        if key not in self._cache:
            self._misses += 1
            return None

        value, timestamp = self._cache[key]

        # Check TTL
        if time.time() - timestamp > self.ttl:
            self.invalidate(key)
            self._misses += 1
            return None

        # Update LRU order
        if key in self._access_order:
            self._access_order.remove(key)
        self._access_order.append(key)

        self._hits += 1
        return value

    def set(self, key: str, value: Any):
        """Set cache value with current timestamp.

        Args:
            key: Cache key
            value: Value to cache
        """
        # Evict oldest if at max size
        if key not in self._cache and len(self._cache) >= self.max_size:
            oldest_key = self._access_order.pop(0)
            del self._cache[oldest_key]

        self._cache[key] = (value, time.time())

        # Update access order
        if key in self._access_order:
            self._access_order.remove(key)
        self._access_order.append(key)

    def invalidate(self, key: str):
        """Remove key from cache.

        Args:
            key: Cache key to remove
        """
        if key in self._cache:
            del self._cache[key]
            if key in self._access_order:
                self._access_order.remove(key)

    def clear(self):
        """Clear all cache."""
        self._cache.clear()
        self._access_order.clear()
        self._hits = 0
        self._misses = 0

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics.

        Returns:
            Dict with hits, misses, size, hit_rate
        """
        total = self._hits + self._misses
        hit_rate = (self._hits / total * 100) if total > 0 else 0.0

        return {
            "hits": self._hits,
            "misses": self._misses,
            "size": len(self._cache),
            "max_size": self.max_size,
            "hit_rate": round(hit_rate, 2),
            "ttl": self.ttl,
        }
