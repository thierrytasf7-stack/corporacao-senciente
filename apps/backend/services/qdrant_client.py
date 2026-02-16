"""
Qdrant Vector Store Client for Diana RAG Pipeline
Port: 21360 (Diana exclusive range)
Index: diana-truth-base with dimension 1536 (OpenAI embeddings)
"""

import os
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams, PointStruct
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    logging.warning("qdrant-client not installed. Install with: pip install qdrant-client")

logger = logging.getLogger("qdrant_client")


class QdrantVectorStore:
    """Manages Qdrant vector store for Diana truth base"""

    def __init__(
        self,
        host: str = "localhost",
        port: int = 21360,
        collection_name: str = "diana-truth-base",
        embedding_dim: int = 1536,
        enabled: bool = True
    ):
        self.host = host
        self.port = port
        self.collection_name = collection_name
        self.embedding_dim = embedding_dim
        self.enabled = enabled and QDRANT_AVAILABLE
        self.client: Optional[QdrantClient] = None

        if self.enabled:
            try:
                self.client = QdrantClient(host=host, port=port)
                logger.info(f"Connected to Qdrant at {host}:{port}")
            except Exception as e:
                logger.error(f"Failed to connect to Qdrant: {e}")
                self.enabled = False

    def ensure_collection(self) -> bool:
        """Create collection if it doesn't exist"""
        if not self.enabled or not self.client:
            return False

        try:
            collections = self.client.get_collections()
            collection_names = [c.name for c in collections.collections]

            if self.collection_name not in collection_names:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.embedding_dim,
                        distance=Distance.COSINE
                    ),
                )
                logger.info(f"Created collection '{self.collection_name}'")
            else:
                logger.info(f"Collection '{self.collection_name}' already exists")
            return True
        except Exception as e:
            logger.error(f"Error ensuring collection: {e}")
            return False

    def index_document(
        self,
        doc_id: str,
        embedding: List[float],
        content: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Index a single document with embedding"""
        if not self.enabled or not self.client:
            return False

        try:
            point = PointStruct(
                id=hash(doc_id) % (10 ** 18),  # Convert to positive int
                vector=embedding,
                payload={
                    "doc_id": doc_id,
                    "content": content,
                    "file": metadata.get("file", "unknown"),
                    "section": metadata.get("section", ""),
                    "timestamp": metadata.get("timestamp", datetime.now().isoformat()),
                    **metadata
                }
            )
            self.client.upsert(
                collection_name=self.collection_name,
                points=[point],
            )
            return True
        except Exception as e:
            logger.error(f"Error indexing document {doc_id}: {e}")
            return False

    def search(
        self,
        query_embedding: List[float],
        limit: int = 5,
        score_threshold: float = 0.8
    ) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        if not self.enabled or not self.client:
            return []

        try:
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit,
                score_threshold=score_threshold,
            )

            documents = []
            for result in results:
                if result.payload:
                    documents.append({
                        "id": result.id,
                        "score": result.score,
                        "file": result.payload.get("file", "unknown"),
                        "section": result.payload.get("section", ""),
                        "content": result.payload.get("content", ""),
                        "timestamp": result.payload.get("timestamp", ""),
                    })
            return documents
        except Exception as e:
            logger.error(f"Error searching: {e}")
            return []

    def delete_collection(self) -> bool:
        """Delete the collection (for reset)"""
        if not self.enabled or not self.client:
            return False

        try:
            self.client.delete_collection(collection_name=self.collection_name)
            logger.info(f"Deleted collection '{self.collection_name}'")
            return True
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
            return False

    def get_collection_info(self) -> Dict[str, Any]:
        """Get collection statistics"""
        if not self.enabled or not self.client:
            return {"enabled": False, "error": "Qdrant not available"}

        try:
            info = self.client.get_collection(self.collection_name)
            return {
                "enabled": True,
                "name": self.collection_name,
                "point_count": info.points_count,
                "vector_size": self.embedding_dim,
                "status": str(info.status),
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {e}")
            return {"enabled": False, "error": str(e)}

    def health_check(self) -> bool:
        """Health check for Qdrant connectivity"""
        if not self.enabled or not self.client:
            return False

        try:
            self.client.get_collections()
            return True
        except Exception:
            return False


# Singleton instance
_qdrant_instance: Optional[QdrantVectorStore] = None


def get_qdrant_client(
    host: str = "localhost",
    port: int = 21360,
    collection_name: str = "diana-truth-base"
) -> QdrantVectorStore:
    """Get or create Qdrant client singleton"""
    global _qdrant_instance
    if _qdrant_instance is None:
        _qdrant_instance = QdrantVectorStore(
            host=host,
            port=port,
            collection_name=collection_name,
            enabled=os.getenv("QDRANT_ENABLED", "true").lower() == "true"
        )
    return _qdrant_instance
