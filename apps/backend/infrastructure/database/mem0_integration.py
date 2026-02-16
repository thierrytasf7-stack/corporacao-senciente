"""
Mem0 Integration Layer
Industry 6.0/7.0 Ready - Intelligent Memory Cache

Mem0 provides:
- Intelligent caching with semantic awareness
- Automatic memory consolidation
- Cross-agent memory sharing
- Personalized retrieval based on context
"""

import os
import asyncio
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import hashlib
import json

from backend.infrastructure.database.qdrant_adapter import (
    QdrantAdapter, VectorPoint, SearchResult, get_qdrant_adapter
)


@dataclass
class MemoryEntry:
    """A memory entry in Mem0"""
    id: str
    content: str
    embedding: List[float]
    metadata: Dict[str, Any] = field(default_factory=dict)
    importance: float = 1.0
    access_count: int = 0
    last_accessed: datetime = field(default_factory=datetime.utcnow)
    created_at: datetime = field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    
    def calculate_relevance(self, current_time: datetime) -> float:
        """Calculate memory relevance based on recency, importance and access"""
        # Recency factor (decays over time)
        hours_since_access = (current_time - self.last_accessed).total_seconds() / 3600
        recency_factor = 1 / (1 + hours_since_access * 0.1)
        
        # Frequency factor
        frequency_factor = min(1.0, self.access_count / 10)
        
        # Combined score
        return (self.importance * 0.4 + recency_factor * 0.4 + frequency_factor * 0.2)
    
    def is_expired(self) -> bool:
        """Check if memory has expired"""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at


class Mem0Cache:
    """
    Mem0 Intelligent Memory Cache
    
    Features:
    - Semantic similarity-based retrieval
    - Automatic importance ranking
    - Memory consolidation
    - TTL-based expiration
    - Cross-agent memory sharing
    """
    
    def __init__(
        self,
        qdrant_adapter: Optional[QdrantAdapter] = None,
        collection_name: str = "mem0_cache",
        max_cache_size: int = 10000,
        default_ttl_hours: int = 24 * 7  # 1 week default
    ):
        self.qdrant = qdrant_adapter or get_qdrant_adapter()
        self.collection_name = collection_name
        self.max_cache_size = max_cache_size
        self.default_ttl_hours = default_ttl_hours
        
        # Local cache for hot memories
        self._hot_cache: Dict[str, MemoryEntry] = {}
        self._hot_cache_size = 100
        
        # Statistics
        self.stats = {
            'hits': 0,
            'misses': 0,
            'stores': 0,
            'evictions': 0
        }
    
    async def initialize(self) -> None:
        """Initialize Mem0 cache"""
        await self.qdrant.connect()
        await self.qdrant.ensure_collection(self.collection_name, vector_size=384)
        print(f"[Mem0] Initialized cache: {self.collection_name}")
    
    async def store(
        self,
        content: str,
        embedding: List[float],
        agent_id: Optional[str] = None,
        memory_type: str = "general",
        importance: float = 1.0,
        ttl_hours: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Store a memory in Mem0
        
        Args:
            content: Text content of the memory
            embedding: Vector embedding
            agent_id: ID of the storing agent
            memory_type: Type of memory (episodic, semantic, procedural)
            importance: Importance score (0-1)
            ttl_hours: Time to live in hours
            metadata: Additional metadata
        
        Returns:
            Memory ID
        """
        memory_id = self._generate_id(content, agent_id)
        
        ttl = ttl_hours or self.default_ttl_hours
        expires_at = datetime.utcnow() + timedelta(hours=ttl)
        
        entry = MemoryEntry(
            id=memory_id,
            content=content,
            embedding=embedding,
            metadata={
                **(metadata or {}),
                'agent_id': agent_id,
                'memory_type': memory_type
            },
            importance=importance,
            created_at=datetime.utcnow(),
            expires_at=expires_at
        )
        
        # Store in Qdrant
        point = VectorPoint(
            id=memory_id,
            vector=embedding,
            payload={
                'content': content,
                'agent_id': agent_id,
                'memory_type': memory_type,
                'importance': importance,
                'access_count': 0,
                'created_at': entry.created_at.isoformat(),
                'expires_at': expires_at.isoformat(),
                **(metadata or {})
            }
        )
        
        await self.qdrant.upsert(self.collection_name, [point])
        
        # Update hot cache
        self._update_hot_cache(entry)
        
        self.stats['stores'] += 1
        return memory_id
    
    async def retrieve(
        self,
        query_embedding: List[float],
        agent_id: Optional[str] = None,
        memory_types: Optional[List[str]] = None,
        limit: int = 5,
        min_similarity: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant memories
        
        Args:
            query_embedding: Query vector
            agent_id: Filter by agent (None = all agents)
            memory_types: Filter by memory types
            limit: Max results
            min_similarity: Minimum similarity threshold
        
        Returns:
            List of relevant memories with scores
        """
        # Build filter conditions
        filters = {}
        if agent_id:
            filters['agent_id'] = agent_id
        if memory_types and len(memory_types) == 1:
            filters['memory_type'] = memory_types[0]
        
        # Search Qdrant
        results = await self.qdrant.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            limit=limit * 2,  # Get more to filter expired
            score_threshold=min_similarity,
            filter_conditions=filters if filters else None
        )
        
        # Filter expired and format results
        valid_results = []
        current_time = datetime.utcnow()
        
        for r in results:
            expires_at_str = r.payload.get('expires_at')
            if expires_at_str:
                expires_at = datetime.fromisoformat(expires_at_str)
                if current_time > expires_at:
                    continue
            
            # Update access count
            await self._increment_access(r.id)
            
            valid_results.append({
                'id': r.id,
                'content': r.payload.get('content', ''),
                'score': r.score,
                'agent_id': r.payload.get('agent_id'),
                'memory_type': r.payload.get('memory_type'),
                'importance': r.payload.get('importance', 1.0),
                'metadata': {k: v for k, v in r.payload.items() 
                           if k not in ['content', 'agent_id', 'memory_type', 'importance']}
            })
            
            if len(valid_results) >= limit:
                break
        
        if valid_results:
            self.stats['hits'] += 1
        else:
            self.stats['misses'] += 1
        
        return valid_results
    
    async def retrieve_for_context(
        self,
        query_embedding: List[float],
        context: Dict[str, Any],
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieve memories optimized for a given context
        
        Args:
            query_embedding: Query vector
            context: Context information (agent_id, task_type, etc.)
            limit: Max results
        
        Returns:
            Contextually relevant memories
        """
        agent_id = context.get('agent_id')
        task_type = context.get('task_type')
        
        # Determine relevant memory types based on task
        memory_types = self._get_relevant_memory_types(task_type)
        
        return await self.retrieve(
            query_embedding=query_embedding,
            agent_id=agent_id,
            memory_types=memory_types,
            limit=limit
        )
    
    async def consolidate_memories(
        self,
        agent_id: str,
        memory_type: str = "episodic",
        consolidation_threshold: int = 10
    ) -> Optional[str]:
        """
        Consolidate similar memories into a semantic memory
        
        Args:
            agent_id: Agent whose memories to consolidate
            memory_type: Type of memories to consolidate
            consolidation_threshold: Min similar memories to trigger consolidation
        
        Returns:
            ID of consolidated memory if created
        """
        # This is a placeholder for actual consolidation logic
        # In production, would use clustering and summarization
        print(f"[Mem0] Consolidation triggered for {agent_id}")
        return None
    
    async def cleanup_expired(self) -> int:
        """Remove expired memories"""
        # In production, would query Qdrant for expired entries
        # For now, just clear hot cache of expired entries
        expired_ids = []
        current_time = datetime.utcnow()
        
        for id, entry in list(self._hot_cache.items()):
            if entry.is_expired():
                expired_ids.append(id)
                del self._hot_cache[id]
        
        if expired_ids:
            await self.qdrant.delete(self.collection_name, expired_ids)
            self.stats['evictions'] += len(expired_ids)
        
        return len(expired_ids)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.stats['hits'] + self.stats['misses']
        hit_rate = self.stats['hits'] / total_requests if total_requests > 0 else 0
        
        return {
            **self.stats,
            'hit_rate': hit_rate,
            'hot_cache_size': len(self._hot_cache)
        }
    
    def _generate_id(self, content: str, agent_id: Optional[str]) -> str:
        """Generate unique memory ID"""
        key = f"{agent_id or 'global'}:{content}:{datetime.utcnow().isoformat()}"
        return hashlib.sha256(key.encode()).hexdigest()[:16]
    
    def _update_hot_cache(self, entry: MemoryEntry) -> None:
        """Update hot cache with LRU eviction"""
        if len(self._hot_cache) >= self._hot_cache_size:
            # Evict least relevant entry
            min_relevance = float('inf')
            min_id = None
            current_time = datetime.utcnow()
            
            for id, e in self._hot_cache.items():
                relevance = e.calculate_relevance(current_time)
                if relevance < min_relevance:
                    min_relevance = relevance
                    min_id = id
            
            if min_id:
                del self._hot_cache[min_id]
        
        self._hot_cache[entry.id] = entry
    
    async def _increment_access(self, memory_id: str) -> None:
        """Increment access count for a memory"""
        if memory_id in self._hot_cache:
            self._hot_cache[memory_id].access_count += 1
            self._hot_cache[memory_id].last_accessed = datetime.utcnow()
    
    def _get_relevant_memory_types(self, task_type: Optional[str]) -> Optional[List[str]]:
        """Determine relevant memory types based on task"""
        if not task_type:
            return None
        
        type_mapping = {
            'decision': ['episodic', 'semantic'],
            'learning': ['procedural', 'semantic'],
            'recall': ['episodic'],
            'planning': ['semantic', 'prospective'],
            'execution': ['procedural']
        }
        
        return type_mapping.get(task_type)


# Global Mem0 instance
_mem0_cache: Optional[Mem0Cache] = None


def get_mem0_cache() -> Mem0Cache:
    """Get global Mem0 cache instance"""
    global _mem0_cache
    
    if _mem0_cache is None:
        _mem0_cache = Mem0Cache()
    
    return _mem0_cache


async def init_mem0() -> None:
    """Initialize Mem0 cache"""
    cache = get_mem0_cache()
    await cache.initialize()


async def close_mem0() -> None:
    """Cleanup Mem0 resources"""
    global _mem0_cache
    
    if _mem0_cache:
        await _mem0_cache.cleanup_expired()
        _mem0_cache = None


# Convenience functions
async def remember(
    content: str,
    embedding: List[float],
    agent_id: Optional[str] = None,
    **kwargs
) -> str:
    """Store a memory"""
    cache = get_mem0_cache()
    return await cache.store(content, embedding, agent_id, **kwargs)


async def recall(
    query_embedding: List[float],
    agent_id: Optional[str] = None,
    limit: int = 5,
    **kwargs
) -> List[Dict[str, Any]]:
    """Retrieve memories"""
    cache = get_mem0_cache()
    return await cache.retrieve(query_embedding, agent_id, limit=limit, **kwargs)
