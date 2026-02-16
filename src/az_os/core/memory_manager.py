import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from .storage import Storage


class MemoryManager:
    """Long-term memory manager with vector embeddings and consolidation"""
    
    def __init__(self, storage: Storage):
        self.storage = storage
        self.memory_dir = Path(".az-os/memory")
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        self.memory_file = self.memory_dir / "memories.json"
        self._load_memories()
        self.vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
    
    def _load_memories(self) -> None:
        """Load memories from file"""
        try:
            if self.memory_file.exists():
                with open(self.memory_file, "r", encoding="utf-8") as f:
                    self.memories = json.load(f)
            else:
                self.memories = []
        except Exception as e:
            self.storage.log_event(
                event_type="memory_load_failed",
                details={
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            self.memories = []
    
    def _save_memories(self) -> None:
        """Save memories to file"""
        try:
            with open(self.memory_file, "w", encoding="utf-8") as f:
                json.dump(self.memories, f, indent=2, default=str)
        except Exception as e:
            self.storage.log_event(
                event_type="memory_save_failed",
                details={
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            raise RuntimeError(f"Failed to save memories: {e}")
    
    def _calculate_memory_vector(self, memory: Dict[str, Any]) -> np.ndarray:
        """Calculate vector representation of memory"""
        content = f"{memory.get('content', '')} {memory.get('context', '')} {memory.get('tags', '')}"
        vectors = self.vectorizer.fit_transform([content])
        return vectors.toarray()[0]
    
    def add_memory(self, content: str, context: str = "", tags: List[str] = None, 
                   priority: int = 1, source: str = "task") -> str:
        """Add a new memory entry"""
        try:
            memory_id = datetime.now().isoformat().replace(":", "-").replace(".", "-")
            memory = {
                "memory_id": memory_id,
                "content": content,
                "context": context,
                "tags": tags or [],
                "priority": priority,
                "source": source,
                "created_at": datetime.now().isoformat(),
                "last_used": datetime.now().isoformat(),
                "usage_count": 0,
                "relevance_score": 0.0
            }
            
            # Calculate vector
            memory["vector"] = self._calculate_memory_vector(memory).tolist()
            
            self.memories.append(memory)
            self._save_memories()
            
            self.storage.log_event(
                event_type="memory_added",
                details={
                    "memory_id": memory_id,
                    "tags": tags,
                    "priority": priority,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return memory_id
            
        except Exception as e:
            self.storage.log_event(
                event_type="memory_add_failed",
                details={
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            raise RuntimeError(f"Failed to add memory: {e}")
    
    def search_memories(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search memories using semantic similarity"""
        try:
            if not self.memories:
                return []
            
            # Calculate query vector
            query_vector = self._calculate_memory_vector({"content": query, "context": "", "tags": []})
            
            # Calculate similarity scores
            memory_vectors = np.array([m["vector"] for m in self.memories])
            similarities = cosine_similarity([query_vector], memory_vectors)[0]
            
            # Update relevance scores
            for i, memory in enumerate(self.memories):
                memory["relevance_score"] = float(similarities[i])
                memory["last_used"] = datetime.now().isoformat()
                memory["usage_count"] = memory.get("usage_count", 0) + 1
            
            # Sort by relevance score and priority
            sorted_memories = sorted(
                self.memories,
                key=lambda m: (m["relevance_score"], m["priority"]),
                reverse=True
            )
            
            self._save_memories()
            
            return sorted_memories[:top_k]
            
        except Exception as e:
            self.storage.log_event(
                event_type="memory_search_failed",
                details={
                    "query": query,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            raise RuntimeError(f"Failed to search memories: {e}")
    
    def get_memory(self, memory_id: str) -> Optional[Dict[str, Any]]:
        """Get specific memory by ID"""
        try:
            for memory in self.memories:
                if memory["memory_id"] == memory_id:
                    memory["last_used"] = datetime.now().isoformat()
                    memory["usage_count"] = memory.get("usage_count", 0) + 1
                    self._save_memories()
                    return memory
            return None
        except Exception as e:
            self.storage.log_event(
                event_type="memory_get_failed",
                details={
                    "memory_id": memory_id,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            raise RuntimeError(f"Failed to get memory: {e}")
    
    def update_memory(self, memory_id: str, updates: Dict[str, Any]) -> bool:
        """Update existing memory"""
        try:
            for memory in self.memories:
                if memory["memory_id"] == memory_id:
                    memory.update(updates)
                    if "content" in updates or "context" in updates or "tags" in updates:
                        memory["vector"] = self._calculate_memory_vector(memory).tolist()
                    memory["last_updated"] = datetime.now().isoformat()
                    self._save_memories()
                    return True
            return False
        except Exception as e:
            self.storage.log_event(
                event_type="memory_update_failed",
                details={
                    "memory_id": memory_id,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            raise RuntimeError(f"Failed to update memory: {e}")
    
    def delete_memory(self, memory_id: str) -> bool:
        """Delete memory by ID"""
        try:
            initial_count = len(self.memories)
            self.memories = [m for m in self.memories if m["memory_id"] != memory_id]
            
            if len(self.memories) < initial_count:
                self._save_memories()
                self.storage.log_event(
                    event_type="memory_deleted",
                    details={
                        "memory_id": memory_id,
                        "timestamp": datetime.now().isoformat()
                    }
                )
                return True
            return False
        except Exception as e:
            self.storage.log_event(
                event_type="memory_delete_failed",
                details={
                    "memory_id": memory_id,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            raise RuntimeError(f"Failed to delete memory: {e}")
    
    def consolidate_memories(self, similarity_threshold: float = 0.8) -> int:
        """Consolidate similar memories to reduce redundancy"""
        try:
            if len(self.memories) < 2:
                return 0
            
            # Calculate all pairwise similarities
            memory_vectors = np.array([m["vector"] for m in self.memories])
            similarities = cosine_similarity(memory_vectors)
            
            # Find similar memories to consolidate
            to_consolidate = defaultdict(list)
            for i in range(len(self.memories)):
                for j in range(i + 1, len(self.memories)):
                    if similarities[i, j] > similarity_threshold:
                        to_consolidate[i].append(j)
            
            # Consolidate memories
            consolidated_count = 0
            new_memories = []
            merged = set()
            
            for i, similar_indices in to_consolidate.items():
                if i in merged:
                    continue
                
                # Merge similar memories
                memories_to_merge = [self.memories[i]] + [self.memories[j] for j in similar_indices]
                merged_content = "\n\n".join(m["content"] for m in memories_to_merge)
                merged_context = " | ".join(m["context"] for m in memories_to_merge)
                merged_tags = list(set(tag for m in memories_to_merge for tag in m["tags"]))
                
                # Create consolidated memory
                consolidated_memory = {
                    "memory_id": datetime.now().isoformat().replace(":", "-").replace(".", "-"),
                    "content": merged_content,
                    "context": merged_context,
                    "tags": merged_tags,
                    "priority": max(m["priority"] for m in memories_to_merge),
                    "source": "consolidated",
                    "created_at": datetime.now().isoformat(),
                    "last_used": datetime.now().isoformat(),
                    "usage_count": sum(m.get("usage_count", 0) for m in memories_to_merge),
                    "relevance_score": max(m["relevance_score"] for m in memories_to_merge),
                    "vector": self._calculate_memory_vector({"content": merged_content, "context": merged_context, "tags": merged_tags}).tolist()
                }
                
                new_memories.append(consolidated_memory)
                merged.update([i] + similar_indices)
                consolidated_count += len(memories_to_merge) - 1
            
            # Add memories that weren't consolidated
            for i, memory in enumerate(self.memories):
                if i not in merged:
                    new_memories.append(memory)
            
            self.memories = new_memories
            self._save_memories()
            
            self.storage.log_event(
                event_type="memories_consolidated",
                details={
                    "consolidated_count": consolidated_count,
                    "remaining_count": len(self.memories),
                    "similarity_threshold": similarity_threshold,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return consolidated_count
            
        except Exception as e:
            self.storage.log_event(
                event_type="memory_consolidation_failed",
                details={
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            raise RuntimeError(f"Failed to consolidate memories: {e}")
    
    def clear_memories(self) -> int:
        """Clear all memories"""
        try:
            initial_count = len(self.memories)
            self.memories = []
            self._save_memories()
            
            self.storage.log_event(
                event_type="memories_cleared",
                details={
                    "deleted_count": initial_count,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return initial_count
            
        except Exception as e:
            self.storage.log_event(
                event_type="memory_clear_failed",
                details={
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            raise RuntimeError(f"Failed to clear memories: {e}")
    
    def get_memory_stats(self) -> Dict[str, Any]:
        """Get memory statistics"""
        try:
            total_memories = len(self.memories)
            total_usage = sum(m.get("usage_count", 0) for m in self.memories)
            avg_usage = total_usage / total_memories if total_memories > 0 else 0
            
            priority_counts = defaultdict(int)
            source_counts = defaultdict(int)
            tag_counts = defaultdict(int)
            
            for memory in self.memories:
                priority_counts[memory["priority"]] += 1
                source_counts[memory["source"]] += 1
                for tag in memory["tags"]:
                    tag_counts[tag] += 1
            
            return {
                "total_memories": total_memories,
                "total_usage": total_usage,
                "avg_usage_per_memory": avg_usage,
                "priority_distribution": dict(priority_counts),
                "source_distribution": dict(source_counts),
                "top_tags": dict(sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10])
            }
            
        except Exception as e:
            self.storage.log_event(
                event_type="memory_stats_failed",
                details={
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            )
            raise RuntimeError(f"Failed to get memory stats: {e}")