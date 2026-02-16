import hashlib
import json
import time
from typing import Optional, Dict, Any, Callable
from functools import wraps
from collections import OrderedDict


class LLMCache:
    """LRU cache with TTL for LLM responses."""
    
    def __init__(self, max_size: int = 1000, ttl: int = 3600):
        self.max_size = max_size
        self.ttl = ttl  # seconds
        self._cache: Dict[str, tuple[Any, float]] = {}
        self._access_order = []
    
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
        self._access_order.remove(key)
        self._access_order.append(key)
        
        return value
    
    def set(self, key: str, value: Any):
        """Set cache value with current timestamp."""
        # Evict oldest if at max size
        if len(self._cache) >= self.max_size:
            oldest_key = self._access_order.pop(0)
            del self._cache[oldest_key]
        
        self._cache[key] = (value, time.time())
        self._access_order.append(key)
    
    def invalidate(self, key: str):
        """Remove key from cache."""
        if key in self._cache:
            del self._cache[key]
            self._access_order.remove(key)
    
    def clear(self):
        """Clear all cache."""
        self._cache.clear()
        self._access_order.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "size": len(self._cache),
            "max_size": self.max_size,
            "ttl_seconds": self.ttl,
            "hit_rate": 0.0  # Will be calculated by monitoring
        }


class CacheDecorator:
    """Decorator for caching function results."""
    
    def __init__(self, cache: LLMCache):
        self.cache = cache
    
    def __call__(self, func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function arguments
            prompt = kwargs.get('prompt', '')
            model = kwargs.get('model', 'gpt-3.5-turbo')
            cache_key = self.cache._generate_key(prompt, model, **kwargs)
            
            # Try cache first
            cached = self.cache.get(cache_key)
            if cached:
                return cached  # Cache hit!
            
            # Cache miss - call function
            result = await func(*args, **kwargs)
            
            # Store in cache
            self.cache.set(cache_key, result)
            
            return result
        
        return wrapper