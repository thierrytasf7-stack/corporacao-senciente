import hashlib
import json
import time
from typing import Optional, Dict, Any, Tuple
from collections import OrderedDict


class LLMCache:
    """LRU cache with TTL for LLM responses."""
    
    def __init__(self, max_size: int = 1000, ttl: int = 3600):
        self.max_size = max_size
        self.ttl = ttl  # seconds
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._access_order = OrderedDict()
    
    def _generate_key(self, prompt: str, model: str, **kwargs) -> str:
        """Generate cache key from prompt + model + params."""
        data = json.dumps({
            "prompt": prompt,
            "model": model,
            **kwargs
        }, sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value if exists and not expired."""
        if key not in self._cache:
            return None
        
        value, timestamp = self._cache[key]
        
        # Check TTL
        if time.time() - timestamp > self.ttl:
            self.invalidate(key)
            return None
        
        # Update LRU order
        self._access_order.move_to_end(key)
        
        return value
    
    def set(self, key: str, value: Any):
        """Set cache value with current timestamp."""
        # Evict oldest if at max size
        if len(self._cache) >= self.max_size:
            oldest_key = next(iter(self._access_order))
            del self._cache[oldest_key]
            del self._access_order[oldest_key]
        
        self._cache[key] = (value, time.time())
        self._access_order[key] = None
        self._access_order.move_to_end(key)
    
    def invalidate(self, key: str):
        """Remove key from cache."""
        if key in self._cache:
            del self._cache[key]
            del self._access_order[key]
    
    def clear(self):
        """Clear all cache."""
        self._cache.clear()
        self._access_order.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "size": len(self._cache),
            "max_size": self.max_size,
            "ttl": self.ttl,
            "hit_rate": 0.0  # Will be calculated by LLMClient
        }


class CacheInvalidationStrategy:
    """Cache invalidation strategies."""
    
    @staticmethod
    def invalidate_by_model(cache: LLMCache, model: str) -> None:
        """Invalidate all cache entries for a specific model."""
        keys_to_invalidate = []
        for key in cache._cache.keys():
            # Parse key to extract model info (simplified implementation)
            # In production, would need proper key parsing logic
            if model in key:
                keys_to_invalidate.append(key)
        
        for key in keys_to_invalidate:
            cache.invalidate(key)
    
    @staticmethod
    def invalidate_by_prompt_pattern(cache: LLMCache, pattern: str) -> None:
        """Invalidate cache entries matching a prompt pattern."""
        keys_to_invalidate = []
        for key in cache._cache.keys():
            # Simplified pattern matching
            if pattern in key:
                keys_to_invalidate.append(key)
        
        for key in keys_to_invalidate:
            cache.invalidate(key)
    
    @staticmethod
    def invalidate_all(cache: LLMCache) -> None:
        """Invalidate entire cache."""
        cache.clear()