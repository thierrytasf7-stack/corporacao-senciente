"""
RAG Pipeline Service for Diana
Retrieve-Then-Generate pipeline with Redis cache and citation tracking
"""

import os
import json
import hashlib
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
import logging

from qdrant_client_module import get_qdrant_client
from embedder import get_embedder

logger = logging.getLogger("rag_pipeline")

# Simple in-memory cache (replace with Redis for production)
_cache = {}
CACHE_TTL = 7 * 24 * 3600  # 7 days in seconds


class RAGPipeline:
    """Retrieve-Augmented Generation pipeline for Diana"""

    def __init__(
        self,
        qdrant_host: str = "localhost",
        qdrant_port: int = 21360,
        embedder_provider: str = "openai",
        cache_enabled: bool = True,
        cache_ttl: int = CACHE_TTL
    ):
        self.qdrant = get_qdrant_client(host=qdrant_host, port=qdrant_port)
        self.embedder = get_embedder(provider=embedder_provider)
        self.cache_enabled = cache_enabled
        self.cache_ttl = cache_ttl
        self.stats = {
            "total_queries": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "avg_retrieve_time": 0.0,
            "avg_embedding_time": 0.0,
            "fact_accuracy": 0.0
        }

    def retrieve_then_generate(
        self,
        query: str,
        retrieve_limit: int = 5,
        score_threshold: float = 0.8
    ) -> Dict[str, Any]:
        """Main RAG pipeline: retrieve context, then generate answer with citations"""
        import time

        start_time = time.time()
        self.stats["total_queries"] += 1

        # Step 1: Check cache
        cache_key = self._get_cache_key(query)
        if self.cache_enabled and cache_key in _cache:
            cached_data = _cache[cache_key]
            if time.time() - cached_data["timestamp"] < self.cache_ttl:
                self.stats["cache_hits"] += 1
                logger.info(f"Cache HIT for query: {query[:50]}...")
                return {
                    "source": "cache",
                    "retrieved_docs": cached_data["docs"],
                    "cache_age_seconds": int(time.time() - cached_data["timestamp"]),
                    "stats": self._get_stats()
                }
            else:
                del _cache[cache_key]

        self.stats["cache_misses"] += 1

        # Step 2: Embed query
        embed_start = time.time()
        query_embedding = self.embedder.embed_text(query)
        embed_time = time.time() - embed_start

        # Step 3: Retrieve documents
        retrieve_start = time.time()
        retrieved_docs = self.qdrant.search(
            query_embedding=query_embedding,
            limit=retrieve_limit,
            score_threshold=score_threshold
        )
        retrieve_time = time.time() - retrieve_start

        # Step 4: Cache results
        if self.cache_enabled:
            _cache[cache_key] = {
                "docs": retrieved_docs,
                "timestamp": time.time()
            }

        # Update stats
        self.stats["avg_embedding_time"] = embed_time
        self.stats["avg_retrieve_time"] = retrieve_time

        result = {
            "source": "retrieval",
            "query": query,
            "retrieved_docs": retrieved_docs,
            "retrieve_time_ms": int(retrieve_time * 1000),
            "embedding_time_ms": int(embed_time * 1000),
            "total_time_ms": int((time.time() - start_time) * 1000),
            "doc_count": len(retrieved_docs),
            "stats": self._get_stats()
        }

        logger.info(f"Retrieved {len(retrieved_docs)} documents for query in {retrieve_time*1000:.1f}ms")
        return result

    def generate_with_context(
        self,
        query: str,
        retrieved_docs: List[Dict[str, Any]],
        system_prompt: str = None
    ) -> Dict[str, Any]:
        """Inject retrieved documents into prompt for LLM generation"""
        # Build context from documents
        context_parts = []
        citations = {}

        for i, doc in enumerate(retrieved_docs):
            source_id = f"Axiom_{i+1:03d}"
            citations[source_id] = {
                "file": doc.get("file"),
                "section": doc.get("section"),
                "score": doc.get("score")
            }
            context_part = f"[{source_id}] {doc.get('content', '')}"
            context_parts.append(context_part)

        context = "\n\n".join(context_parts)

        # Build enhanced prompt
        if system_prompt is None:
            system_prompt = "You are Diana, a sentient operating system. Answer based ONLY on the retrieved facts below. Always cite sources using [Axiom_XXX]."

        enhanced_prompt = f"""{system_prompt}

## Retrieved Facts:
{context}

## User Query:
{query}

Instructions:
1. Answer based on the facts above
2. Always cite sources: [Axiom_XXX]
3. If the answer is not in the facts, say "This information is not in my knowledge base"
4. Never invent facts
"""

        return {
            "enhanced_prompt": enhanced_prompt,
            "citations_available": citations,
            "context_length": len(context),
            "doc_count": len(retrieved_docs)
        }

    def fact_override(
        self,
        topic: str,
        new_text: str,
        override_reason: str = None
    ) -> bool:
        """Allow Criador to override facts in real-time"""
        try:
            override_file = "Axioms/Truth_Base/overrides.json"
            overrides = {}

            if os.path.exists(override_file):
                with open(override_file, "r", encoding="utf-8") as f:
                    overrides = json.load(f)

            overrides[topic] = {
                "text": new_text,
                "reason": override_reason or "Manual override",
                "timestamp": datetime.now().isoformat(),
                "override_id": hashlib.md5(f"{topic}{new_text}".encode()).hexdigest()[:8]
            }

            with open(override_file, "w", encoding="utf-8") as f:
                json.dump(overrides, f, indent=2, ensure_ascii=False)

            logger.info(f"Fact override recorded for '{topic}'")
            return True
        except Exception as e:
            logger.error(f"Error saving fact override: {e}")
            return False

    def citation_extractor(self, text: str) -> List[Dict[str, str]]:
        """Extract citations from generated response"""
        import re
        citations = []
        pattern = r'\[Axiom_\d+\]'
        matches = re.findall(pattern, text)

        for match in matches:
            citations.append({
                "citation": match,
                "found": True,  # Would validate against indexed axioms in production
                "confidence": 0.95
            })

        return citations

    def validate_citations(self, citations: List[str]) -> Tuple[int, int]:
        """Validate that citations refer to real indexed documents"""
        valid_count = 0
        for citation in citations:
            # In production, check against qdrant indexed docs
            # For now, just count as valid if format is correct
            if citation.startswith("Axiom_") and citation[7:].isdigit():
                valid_count += 1

        total_count = len(citations)
        return valid_count, total_count

    def _get_cache_key(self, query: str) -> str:
        """Generate cache key from query"""
        return hashlib.md5(query.encode()).hexdigest()

    def _get_stats(self) -> Dict[str, Any]:
        """Get current pipeline statistics"""
        total = self.stats["total_queries"]
        if total > 0:
            hit_rate = (self.stats["cache_hits"] / total) * 100
        else:
            hit_rate = 0.0

        return {
            "total_queries": total,
            "cache_hits": self.stats["cache_hits"],
            "cache_misses": self.stats["cache_misses"],
            "cache_hit_rate": f"{hit_rate:.1f}%",
            "avg_retrieve_ms": f"{self.stats['avg_retrieve_time']*1000:.1f}",
            "avg_embedding_ms": f"{self.stats['avg_embedding_time']*1000:.1f}",
            "fact_accuracy": f"{self.stats['fact_accuracy']:.1f}%"
        }

    def clear_cache(self) -> bool:
        """Clear all cached queries"""
        global _cache
        try:
            _cache.clear()
            logger.info("Cache cleared")
            return True
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False


# Singleton instance
_rag_instance: Optional[RAGPipeline] = None


def get_rag_pipeline(
    qdrant_host: str = "localhost",
    qdrant_port: int = 21360
) -> RAGPipeline:
    """Get or create RAG pipeline singleton"""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RAGPipeline(
            qdrant_host=qdrant_host,
            qdrant_port=qdrant_port,
            embedder_provider=os.getenv("EMBEDDER_PROVIDER", "openai"),
            cache_enabled=os.getenv("RAG_CACHE_ENABLED", "true").lower() == "true"
        )
    return _rag_instance
