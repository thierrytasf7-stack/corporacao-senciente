import pytest
import asyncio
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
from src.az_os.core.llm_client import LLMClient


class TestLLMClientCaching:
    """Test LLMClient caching functionality"""
    
    def test_client_initialization_with_cache(self):
        """Test client initialization with cache enabled"""
        client = LLMClient(cache_enabled=True)
        assert client.cache_enabled is True
        assert client.cache is not None
        assert client.cache.max_size == 1000
        assert client.cache.ttl == 3600
    
    def test_client_initialization_without_cache(self):
        """Test client initialization with cache disabled"""
        client = LLMClient(cache_enabled=False)
        assert client.cache_enabled is False
        assert client.cache is None
    
    def test_client_custom_cache_configuration(self):
        """Test client with custom cache configuration"""
        client = LLMClient(cache_enabled=True, max_cache_size=500, cache_ttl=1800)
        assert client.cache_enabled is True
        assert client.cache is not None
        assert client.cache.max_size == 500
        assert client.cache.ttl == 1800
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_cache_hit(self, mock_openai):
        """Test cache hit scenario"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True)
        
        # First call - should hit API
        result1 = await client.complete("test prompt", "gpt-3.5-turbo")
        assert result1 == "mock response"
        
        # Second call - should hit cache
        result2 = await client.complete("test prompt", "gpt-3.5-turbo")
        assert result2 == "mock response"
        
        # Verify cache was used
        assert client.cache.get_stats()["size"] == 1
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_cache_miss(self, mock_openai):
        """Test cache miss scenario"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True)
        
        # Call with different prompt - should be cache miss
        result1 = await client.complete("first prompt", "gpt-3.5-turbo")
        assert result1 == "mock response"
        
        result2 = await client.complete("second prompt", "gpt-3.5-turbo")
        assert result2 == "mock response"
        
        # Verify both entries are in cache
        assert client.cache.get_stats()["size"] == 2
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_cache_invalidation(self, mock_openai):
        """Test cache invalidation"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True)
        
        # Add to cache
        await client.complete("test prompt", "gpt-3.5-turbo")
        assert client.cache.get_stats()["size"] == 1
        
        # Invalidate cache
        client.invalidate_cache("test prompt", "gpt-3.5-turbo")
        assert client.cache.get_stats()["size"] == 0
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_cache_clear(self, mock_openai):
        """Test cache clearing"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True)
        
        # Add multiple entries to cache
        await client.complete("prompt1", "gpt-3.5-turbo")
        await client.complete("prompt2", "gpt-3.5-turbo")
        assert client.cache.get_stats()["size"] == 2
        
        # Clear cache
        client.clear_cache()
        assert client.cache.get_stats()["size"] == 0
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_cache_ttl_expiration(self, mock_openai):
        """Test cache TTL expiration"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        # Create client with short TTL
        client = LLMClient(cache_enabled=True, cache_ttl=1)
        
        # Add to cache
        await client.complete("test prompt", "gpt-3.5-turbo")
        assert client.cache.get_stats()["size"] == 1
        
        # Wait for TTL to expire
        time.sleep(2)
        
        # Call again - should be cache miss
        result = await client.complete("test prompt", "gpt-3.5-turbo")
        assert result == "mock response"
        assert client.cache.get_stats()["size"] == 1
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_cache_max_size_eviction(self, mock_openai):
        """Test cache max size eviction"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        # Create client with small max size
        client = LLMClient(cache_enabled=True, max_cache_size=3)
        
        # Add 4 entries (should evict the oldest)
        await client.complete("prompt1", "gpt-3.5-turbo")
        await client.complete("prompt2", "gpt-3.5-turbo")
        await client.complete("prompt3", "gpt-3.5-turbo")
        await client.complete("prompt4", "gpt-3.5-turbo")
        
        # Verify cache size is 3 (max size)
        assert client.cache.get_stats()["size"] == 3
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_cache_performance_improvement(self, mock_openai):
        """Test cache performance improvement"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True)
        
        # Test without cache first
        client_no_cache = LLMClient(cache_enabled=False)
        
        # Measure time without cache
        start_time = time.time()
        for i in range(10):
            await client_no_cache.complete(f"prompt_{i}", "gpt-3.5-turbo")
        without_cache_time = time.time() - start_time
        
        # Measure time with cache (first call - cache miss)
        start_time = time.time()
        for i in range(10):
            await client.complete(f"prompt_{i}", "gpt-3.5-turbo")
        # Second call - cache hit
        for i in range(10):
            await client.complete(f"prompt_{i}", "gpt-3.5-turbo")
        with_cache_time = time.time() - start_time
        
        # Verify performance improvement
        assert with_cache_time < without_cache_time
        assert (without_cache_time / with_cache_time) >= 2.0  # At least 2x improvement
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_cache_hit_rate_measurement(self, mock_openai):
        """Test cache hit rate measurement"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True)
        
        # First call - cache miss
        await client.complete("prompt1", "gpt-3.5-turbo")
        
        # Second call - cache hit
        await client.complete("prompt1", "gpt-3.5-turbo")
        
        # Get cache stats
        stats = client.get_cache_stats()
        assert stats["cache_enabled"] is True
        assert stats["size"] == 1
        assert "hit_rate" in stats
        assert 0.0 <= stats["hit_rate"] <= 1.0
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_cache_config_update(self, mock_openai):
        """Test cache configuration update"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True, max_cache_size=100, cache_ttl=3600)
        
        # Update cache configuration
        client.set_cache_config(max_size=200, ttl=1800)
        
        # Verify configuration updated
        assert client.cache.max_size == 200
        assert client.cache.ttl == 1800


class TestLLMClientIntegration:
    """Test LLMClient integration with caching"""
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_chat_with_rag_caching(self, mock_openai):
        """Test chat_with_rag caching"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True)
        
        # Test chat_with_rag
        result1 = await client.chat_with_rag("question", "context")
        assert result1 == "mock response"
        
        # Should be cached
        result2 = await client.chat_with_rag("question", "context")
        assert result2 == "mock response"
        
        # Verify cache was used
        assert client.cache.get_stats()["size"] == 1
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_batch_chat_caching(self, mock_openai):
        """Test batch_chat caching"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="mock response"))]
        mock_openai.OpenAI.return_value.chat.completions.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True)
        
        # Test batch_chat
        messages = ["message1", "message2"]
        result1 = await client.batch_chat(messages)
        assert len(result1) == 2
        assert result1[0] == "mock response"
        assert result1[1] == "mock response"
        
        # Should be cached
        result2 = await client.batch_chat(messages)
        assert len(result2) == 2
        
        # Verify cache was used
        assert client.cache.get_stats()["size"] == 2
    
    @patch('src.az_os.core.llm_client.openai')
    async def test_embeddings_not_cached(self, mock_openai):
        """Test embeddings are not cached"""
        # Setup mock API response
        mock_response = Mock()
        mock_response.data = [Mock(embedding=[0.1, 0.2, 0.3])]
        mock_openai.OpenAI.return_value.embeddings.create.return_value = mock_response
        
        client = LLMClient(cache_enabled=True)
        
        # Test embeddings
        result1 = await client.embeddings("test text")
        assert result1 == [0.1, 0.2, 0.3]
        
        # Call again - should not be cached
        result2 = await client.embeddings("test text")
        assert result2 == [0.1, 0.2, 0.3]
        
        # Verify cache size is 0 (embeddings not cached)
        assert client.cache.get_stats()["size"] == 0