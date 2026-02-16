import openai
import os
import time
from typing import List, Dict, Any, Optional
from cache import LLMCache


class LLMClient:
    def __init__(self, cache_enabled: bool = True, max_cache_size: int = 1000, cache_ttl: int = 3600):
        self.api_key = self._get_api_key()
        self.client = openai.OpenAI(api_key=self.api_key)
        self.cache_enabled = cache_enabled
        
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
        # Try cache first
        if self.cache:
            cache_key = self.cache._generate_key(prompt, model, **kwargs)
            cached = self.cache.get(cache_key)
            if cached:
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
    
    async def batch_chat(self, messages: List[str], 
                        model: str = "gpt-3.5-turbo") -> List[str]:
        """Send batch of chat messages"""
        try:
            responses = []
            for message in messages:
                response = await self.complete(message, model)
                responses.append(response)
            
            return responses
            
        except Exception as e:
            raise RuntimeError(f"Batch chat failed: {e}")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if self.cache:
            return self.cache.get_stats()
        return {"cache_enabled": False, "size": 0, "max_size": 0}
    
    def clear_cache(self):
        """Clear the cache"""
        if self.cache:
            self.cache.clear()
    
    def invalidate_cache(self, prompt: str, model: str = "gpt-3.5-turbo", **kwargs):
        """Invalidate specific cache entry"""
        if self.cache:
            cache_key = self.cache._generate_key(prompt, model, **kwargs)
            self.cache.invalidate(cache_key)
    
    def set_cache_config(self, max_size: int = None, ttl: int = None):
        """Configure cache settings"""
        if self.cache:
            if max_size is not None:
                self.cache.max_size = max_size
            if ttl is not None:
                self.cache.ttl = ttl