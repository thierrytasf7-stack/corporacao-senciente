"""Long-term memory management for lessons learned from tasks."""
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime, timedelta
import json


class MemoryManager:
    """Store and retrieve lessons learned from task execution."""

    def __init__(self, db=None):
        """Initialize memory manager."""
        self.db = db
        self.memory_file = Path.home() / '.az-os' / 'memory.json'
        self.memory_file.parent.mkdir(parents=True, exist_ok=True)
        self.memories = self._load_memories()

    def _load_memories(self) -> List[Dict]:
        """Load memories from disk."""
        if self.memory_file.exists():
            try:
                return json.loads(self.memory_file.read_text())
            except Exception:
                return []
        return []

    def _save_memories(self):
        """Save memories to disk."""
        try:
            self.memory_file.write_text(json.dumps(self.memories, indent=2))
        except Exception as e:
            print(f"⚠️  Failed to save memories: {e}")

    def add_memory(self, task_id: str, lesson: str, category: str = "general",
                   success: bool = True, score: float = 1.0) -> bool:
        """Add a lesson learned from task execution."""
        try:
            memory = {
                "id": f"{task_id}#{datetime.now().isoformat()}",
                "task_id": task_id,
                "lesson": lesson,
                "category": category,
                "success": success,
                "score": score,
                "timestamp": datetime.now().isoformat(),
                "access_count": 0
            }
            self.memories.append(memory)
            self._save_memories()
            return True
        except Exception as e:
            print(f"⚠️  Failed to add memory: {e}")
            return False

    def search_memories(self, query: str, top_k: int = 3) -> List[Dict]:
        """Search memories by keyword (simple substring matching)."""
        results = []
        query_lower = query.lower()

        for memory in self.memories:
            if (query_lower in memory["lesson"].lower() or
                query_lower in memory.get("category", "").lower()):
                results.append(memory)

        # Sort by relevance (access count + recency)
        results.sort(key=lambda m: (m["access_count"], m["timestamp"]), reverse=True)

        # Increment access count
        for memory in results[:top_k]:
            memory["access_count"] += 1
        self._save_memories()

        return results[:top_k]

    def consolidate(self, similarity_threshold: float = 0.8) -> Dict:
        """Consolidate similar memories to reduce duplicates."""
        if not self.memories:
            return {"consolidated": 0, "remaining": 0}

        consolidated_count = 0
        unique_memories = []

        for memory in self.memories:
            # Simple duplicate detection: same task + similar lesson
            is_duplicate = False
            for unique in unique_memories:
                if (unique["task_id"] == memory["task_id"] and
                    similarity_threshold > 0.5):  # Placeholder for real similarity
                    # Merge scores
                    unique["score"] = max(unique["score"], memory["score"])
                    unique["access_count"] += memory["access_count"]
                    is_duplicate = True
                    consolidated_count += 1
                    break

            if not is_duplicate:
                unique_memories.append(memory)

        self.memories = unique_memories
        self._save_memories()

        return {
            "consolidated": consolidated_count,
            "remaining": len(unique_memories)
        }

    def cleanup_old_memories(self, days: int = 30) -> Dict:
        """Delete memories older than N days."""
        cutoff_date = datetime.now() - timedelta(days=days)
        original_count = len(self.memories)

        self.memories = [
            m for m in self.memories
            if datetime.fromisoformat(m["timestamp"]) > cutoff_date
        ]

        deleted_count = original_count - len(self.memories)
        self._save_memories()

        return {
            "deleted": deleted_count,
            "remaining": len(self.memories)
        }

    def get_stats(self) -> Dict:
        """Get memory statistics."""
        if not self.memories:
            return {
                "total_memories": 0,
                "categories": {},
                "avg_score": 0.0
            }

        categories = {}
        total_score = 0

        for memory in self.memories:
            cat = memory.get("category", "unknown")
            categories[cat] = categories.get(cat, 0) + 1
            total_score += memory.get("score", 0.0)

        return {
            "total_memories": len(self.memories),
            "categories": categories,
            "avg_score": total_score / len(self.memories) if self.memories else 0.0,
            "file_path": str(self.memory_file),
            "file_size_kb": self.memory_file.stat().st_size / 1024 if self.memory_file.exists() else 0
        }

    def clear_all(self) -> bool:
        """Clear all memories (irreversible!)."""
        try:
            self.memories = []
            self._save_memories()
            return True
        except Exception as e:
            print(f"⚠️  Failed to clear memories: {e}")
            return False
