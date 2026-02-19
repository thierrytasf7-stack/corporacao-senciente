import openai
import os
import time
from typing import List, Dict, Any, Optional
from cache import LLMCache, CacheInvalidationStrategy


class LLMClient:
    def __init__(self, cache_enabled: bool = True, max_cache_size: int = 1000, cache_ttl: int = 3600):
        self.api_key = self._get_api_key()
        self.client = openai.OpenAI(api_key=self.api_key)
        self.cache_enabled = cache_enabled
        self._request_count = 0
        self._hit_count = 0
        
        if cache_enabled:
            self.cache = LLMCache(max_size=max_cache_size, ttl=cache_ttl)
        else:
            self.cache = None
    
    def _get_api_key(self) -> str:
        """Get OpenAI API key from environment"""
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        return api_key
    
    async def complete(self, prompt: str, model: str = "gpt-3.5-turbo", **kwargs) -> str:
        """Send chat message with caching support"""
        self._request_count += 1
        
        # Try cache first
        if self.cache:
            cache_key = self.cache._generate_key(prompt, model, **kwargs)
            cached = self.cache.get(cache_key)
            if cached:
                self._hit_count += 1
                return cached  # Cache hit!
        
        # Cache miss - call API
        response = await self._api_call(prompt, model, **kwargs)
        
        # Store in cache
        if self.cache:
            self.cache.set(cache_key, response)
        
        return response
    
    async def _api_call(self, prompt: str, model: str, **kwargs) -> str:
        """Internal API call method"""
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7,
                **kwargs
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise RuntimeError(f"Chat failed: {e}")
    
    async def embeddings(self, text: str, model: str = "text-embedding-3-small") -> List[float]:
        """Generate text embeddings"""
        try:
            response = self.client.embeddings.create(
                model=model,
                input=text
            )
            
            return response.data[0].embedding
            
        except Exception as e:
            raise RuntimeError(f"Embeddings failed: {e}")
    
    async def chat_with_rag(self, message: str, context: str, 
                           model: str = "gpt-3.5-turbo") -> str:
        """Chat with RAG context"""
        try:
            prompt = "\n".join([
                "You are an AI assistant with access to specific context.",
                "Use only the provided context to answer questions.",
                "If the answer is not in the context, say 'I don't know'.",
                "\nContext:",
                context,
                "\n\nQuestion:",
                message
            ])
            
            return await self.complete(prompt, model)
            
        except Exception as e:
            raise RuntimeError(f"RAG chat failed: {e}")
    
    def invalidate_cache(self, model: Optional[str] = None, pattern: Optional[str] = None) -> None:
        """Invalidate cache entries"""
        if not self.cache:
            return
        
        if model:
            CacheInvalidationStrategy.invalidate_by_model(self.cache, model)
        elif pattern:
            CacheInvalidationStrategy.invalidate_by_prompt_pattern(self.cache, pattern)
        else:
            CacheInvalidationStrategy.invalidate_all(self.cache)
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.cache:
            return {
                "cache_enabled": False,
                "size": 0,
                "max_size": 0,
                "ttl": 0,
                "hit_rate": 0.0,
                "requests": self._request_count,
                "hits": self._hit_count
            }
        
        stats = self.cache.get_stats()
        stats["cache_enabled"] = True
        stats["requests"] = self._request_count
        stats["hits"] = self._hit_count
        
        if self._request_count > 0:
            stats["hit_rate"] = self._hit_count / self._request_count
        else:
            stats["hit_rate"] = 0.0
        
        return stats


# Legacy compatibility
class Cache(LLMCache):
    """Legacy cache class for backward compatibility"""
    pass

class CacheInvalidationStrategyLegacy:
    """Legacy cache invalidation strategy for backward compatibility"""
    
    @staticmethod
    def invalidate_by_model(cache: LLMCache, model: str) -> None:
        CacheInvalidationStrategy.invalidate_by_model(cache, model)
    
    @staticmethod
    def invalidate_by_prompt_pattern(cache: LLMCache, pattern: str) -> None:
        CacheInvalidationStrategy.invalidate_by_prompt_pattern(cache, pattern)
    
    @staticmethod
    def invalidate_all(cache: LLMCache) -> None:
        CacheInvalidationStrategy.invalidate_all(cache)