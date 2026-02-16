"""
Embedder Service for Diana RAG
Supports: OpenAI API (ada-002), Ollama local (fallback), mock embeddings (offline)
"""

import os
import json
import hashlib
from typing import List, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger("embedder")


class EmbedderService:
    """Generate embeddings for documents"""

    def __init__(
        self,
        provider: str = "openai",  # "openai" | "ollama" | "mock"
        model: str = "text-embedding-3-small",
        api_key: Optional[str] = None,
        ollama_url: str = "http://localhost:11434",
        embedding_dim: int = 1536
    ):
        self.provider = provider
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.ollama_url = ollama_url
        self.embedding_dim = embedding_dim
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initialize embedding client based on provider"""
        if self.provider == "openai":
            try:
                import openai
                openai.api_key = self.api_key
                self.client = openai.Embedding
                logger.info("OpenAI embedder initialized")
            except ImportError:
                logger.warning("openai package not installed, falling back to mock")
                self.provider = "mock"
            except Exception as e:
                logger.error(f"OpenAI init failed: {e}, using mock")
                self.provider = "mock"

        elif self.provider == "ollama":
            try:
                import requests
                # Test connection
                requests.get(f"{self.ollama_url}/api/tags", timeout=2)
                self.client = requests
                logger.info(f"Ollama embedder initialized at {self.ollama_url}")
            except Exception as e:
                logger.warning(f"Ollama not available: {e}, using mock")
                self.provider = "mock"

    def embed_text(self, text: str) -> List[float]:
        """Generate embedding for text"""
        if self.provider == "openai" and self.client:
            return self._embed_openai(text)
        elif self.provider == "ollama" and self.client:
            return self._embed_ollama(text)
        else:
            return self._embed_mock(text)

    def _embed_openai(self, text: str) -> List[float]:
        """Embed using OpenAI API"""
        try:
            import openai
            response = openai.Embedding.create(
                input=text,
                model=self.model,
            )
            embedding = response["data"][0]["embedding"]
            logger.debug(f"OpenAI embedding generated, dim={len(embedding)}")
            return embedding
        except Exception as e:
            logger.error(f"OpenAI embedding failed: {e}, using mock")
            return self._embed_mock(text)

    def _embed_ollama(self, text: str) -> List[float]:
        """Embed using Ollama local model"""
        try:
            response = self.client.post(
                f"{self.ollama_url}/api/embed",
                json={
                    "model": self.model,
                    "input": text
                },
                timeout=30
            )
            response.raise_for_status()
            embedding = response.json().get("embeddings", [[]])[0]
            logger.debug(f"Ollama embedding generated, dim={len(embedding)}")
            return embedding
        except Exception as e:
            logger.error(f"Ollama embedding failed: {e}, using mock")
            return self._embed_mock(text)

    def _embed_mock(self, text: str) -> List[float]:
        """Generate deterministic mock embedding for offline/testing"""
        # Create consistent mock embedding based on text hash
        hash_obj = hashlib.sha256(text.encode())
        hash_int = int(hash_obj.hexdigest(), 16)

        # Generate embedding_dim values between -1 and 1
        embedding = []
        for i in range(self.embedding_dim):
            value = ((hash_int >> (i % 256)) % 1000) / 500.0 - 1.0
            embedding.append(value)

        logger.debug(f"Mock embedding generated, dim={len(embedding)}")
        return embedding

    def embed_batch(
        self,
        texts: List[str],
        batch_size: int = 20
    ) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        embeddings = []
        for i, text in enumerate(texts):
            embedding = self.embed_text(text)
            embeddings.append(embedding)
            if (i + 1) % batch_size == 0:
                logger.info(f"Embedded {i + 1}/{len(texts)} documents")
        return embeddings

    def embed_with_tokens(self, text: str) -> Tuple[List[float], int]:
        """Generate embedding and estimate token count"""
        embedding = self.embed_text(text)
        # Rough token estimation: ~1 token per 4 characters
        token_count = len(text) // 4
        return embedding, token_count


# Singleton instance
_embedder_instance: Optional[EmbedderService] = None


def get_embedder(provider: str = "openai") -> EmbedderService:
    """Get or create embedder singleton"""
    global _embedder_instance
    if _embedder_instance is None:
        _embedder_instance = EmbedderService(provider=provider)
    return _embedder_instance
